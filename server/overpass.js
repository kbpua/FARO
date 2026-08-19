// overpass.js - OpenStreetMap data via Overpass API
const axios = require('axios');

const NOMINATIM_LOOKUP = 'https://nominatim.openstreetmap.org/lookup';
const HEADERS = { 'User-Agent': 'FaroApp/2.0 (contact: info@faro.local)' };

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

const OVERPASS_TIMEOUT_MS = 7000;        // reduced: mirrors raced in parallel, faster fail is fine
const CACHE_TTL_MS = 120000;             // 2 min: positive result cache
const NEGATIVE_CACHE_TTL_MS = 90000;    // 90 s: cache zero-result / all-failed outcomes
const MIRROR_COOLDOWN_MS = 120000;      // 2 min: skip recently-failed mirrors
const SERVERLESS_RUNTIME = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Two-tier cache: raw Overpass results + filtered composite entries
const rawCache = new Map();
const filteredCache = new Map();
// Negative cache: keys that returned zero results or all-mirror failures
const negativeCache = new Map();
// Mirror health: tracks recent failures per endpoint (endpoint -> expiresAt)
const mirrorCooldowns = new Map();
let lastNominatimCall = 0;

function buildRawCacheKey({ lat, lng, radius, keyword = '' }) {
  return [lat.toFixed(3), lng.toFixed(3), radius, keyword || ''].join('|');
}

function buildOverpassQuery({ lat, lng, radius, keyword = '' }) {
  const amenityFilter = '"amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream)$"';
  const shopFilter = '"shop"~"^(bakery|coffee)$"';
  const nameClause = keyword ? `["name"~"${keyword}",i]` : '';
  return `[out:json][timeout:10];
(
  node[${amenityFilter}]${nameClause}(around:${radius},${lat},${lng});
  way[${amenityFilter}]${nameClause}(around:${radius},${lat},${lng});
  node[${shopFilter}]${nameClause}(around:${radius},${lat},${lng});
  way[${shopFilter}]${nameClause}(around:${radius},${lat},${lng});
);
out center tags;`;
}

function buildCacheKey({ lat, lng, radius, category = 'all', cuisine = 'all', keyword = '' }) {
  return [
    lat.toFixed(3),
    lng.toFixed(3),
    radius,
    category || 'all',
    cuisine || 'all',
    keyword || '',
  ].join('|');
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseCuisineTags(cuisineTag) {
  if (!cuisineTag) return [];
  return String(cuisineTag)
    .toLowerCase()
    .split(/[;,]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function matchesCuisine(placeCuisine, selectedCuisine) {
  if (!selectedCuisine || selectedCuisine === 'all') return true;

  const tags = parseCuisineTags(placeCuisine);
  if (tags.length === 0) return null;

  const selected = selectedCuisine.toLowerCase();

  if (selected === 'cafe_bakery') {
    return tags.some(t =>
      ['cafe', 'coffee', 'bakery', 'pastry', 'tea', 'cake', 'dessert'].some(k => t.includes(k))
    );
  }

  const aliases = {
    filipino: ['filipino', 'pinoy'],
    italian: ['italian', 'pizza', 'pasta'],
    japanese: ['japanese', 'sushi', 'ramen'],
    korean: ['korean', 'bbq'],
    american: ['american', 'burger'],
    chinese: ['chinese', 'dim_sum', 'dim sum'],
    mediterranean: ['mediterranean', 'greek', 'lebanese'],
    mexican: ['mexican', 'taco', 'tex-mex'],
  };

  const needles = aliases[selected] || [selected];
  return tags.some(tag => needles.some(n => tag.includes(n) || n.includes(tag)));
}


function matchesCategory(placeCategory, selectedCategory) {
  if (!selectedCategory || selectedCategory === 'all') return true;
  return placeCategory === selectedCategory;
}

function applyFilters(places, { category, cuisine }) {
  let filtered = places;

  if (category && category !== 'all') {
    filtered = filtered.filter(p => matchesCategory(p.category, category));
  }

  let cuisineDataLimited = false;

  if (cuisine && cuisine !== 'all') {
    const tagged = filtered.filter(p => parseCuisineTags(p.cuisine).length > 0);
    const taggedRatio = filtered.length > 0 ? tagged.length / filtered.length : 0;

    console.log('[Overpass] cuisine filter diagnostic:', {
      selectedCuisine: cuisine,
      totalBeforeFilter: filtered.length,
      taggedCount: tagged.length,
      taggedRatio: taggedRatio.toFixed(2),
      sampleTags: tagged.slice(0, 10).map(p => p.cuisine),
    });

    if (taggedRatio < 0.3) {
      // Sparse tagging: include matches + untagged, exclude clearly conflicting tags
      cuisineDataLimited = true;
      filtered = filtered.filter(p => {
        const match = matchesCuisine(p.cuisine, cuisine);
        if (match === true) return true;
        if (match === null) return true;
        return false;
      });
    } else {
      filtered = filtered.filter(p => matchesCuisine(p.cuisine, cuisine) === true);
    }
  }

  return { filtered, cuisineDataLimited };
}

/** Mark an endpoint as unhealthy for MIRROR_COOLDOWN_MS */
function recordMirrorFailure(endpoint) {
  mirrorCooldowns.set(endpoint, Date.now() + MIRROR_COOLDOWN_MS);
}

/** Order mirrors: healthy ones first, cooldown ones last */
function orderedMirrors() {
  const now = Date.now();
  const healthy = [];
  const cooling = [];
  for (const ep of OVERPASS_ENDPOINTS) {
    const coolUntil = mirrorCooldowns.get(ep) || 0;
    if (coolUntil > now) {
      cooling.push(ep);
    } else {
      healthy.push(ep);
    }
  }
  console.log('[Overpass] mirror order:', { healthy, cooling: cooling.map(c => `${c} (cooldown ${Math.round((mirrorCooldowns.get(c) - now) / 1000)}s)`) });
  return [...healthy, ...cooling];
}

async function requestOverpassMirror(endpoint, params, headers) {
  const start = Date.now();
  const resp = await axios.post(endpoint, params, { headers, timeout: OVERPASS_TIMEOUT_MS });
  const durationMs = Date.now() - start;
  const elementCount = Array.isArray(resp?.data?.elements) ? resp.data.elements.length : 0;
  return { resp, endpoint, durationMs, elementCount };
}

/**
 * Race ALL mirrors in parallel; whichever returns data first wins.
 * Mirrors with a recent failure are still attempted (as last resort) but
 * failures are recorded so they're deprioritised on the next call.
 * Empty-result responses (elementCount === 0) are NOT treated as a win —
 * we continue waiting for another mirror that may have actual data.
 * NOTE: osm.ch genuinely returns 0 elements for many SEA coordinates
 * (confirmed manually for 14.574, 121.028) — it is not a query bug.
 */
async function fetchOverpassData(query) {
  const headers = { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' };
  const params = new URLSearchParams({ data: query }).toString();
  const requestStart = Date.now();
  const attempts = [];

  const mirrors = orderedMirrors();

  // AbortController-style cancellation: once a winner is found we reject
  // all other pending promises by resolving a shared signal.
  let cancelOthers = () => {};
  const cancelSignal = new Promise((_, reject) => { cancelOthers = () => reject(new Error('cancelled')); });

  const mirrorPromises = mirrors.map(async endpoint => {
    try {
      const result = await Promise.race([requestOverpassMirror(endpoint, params, headers), cancelSignal]);
      const attempt = { mirror: endpoint, status: 'success', durationMs: result.durationMs, elementCount: result.elementCount };
      attempts.push(attempt);
      if (result.elementCount === 0) {
        // Record sparse-data endpoint so we deprioritise next time
        recordMirrorFailure(endpoint);
        console.warn('[Overpass] mirror returned 0 elements (sparse data area)', { mirror: endpoint, durationMs: result.durationMs });
        throw new Error('zero elements');
      }
      console.log('[Overpass] race winner', { mirror: endpoint, durationMs: result.durationMs, elementCount: result.elementCount, totalMs: Date.now() - requestStart });
      cancelOthers();
      return { ...result, attempts };
    } catch (err) {
      if (err.message === 'cancelled') throw err; // propagate cancel, don't record as failure
      attempts.push({ mirror: endpoint, status: 'failed', error: err.message });
      recordMirrorFailure(endpoint);
      console.warn(`[Overpass] mirror failed (${endpoint}): ${err.message}`);
      throw err;
    }
  });

  try {
    return await Promise.any(mirrorPromises);
  } catch {
    const error = new Error('All Overpass mirrors failed or returned no data');
    error.attempts = attempts;
    console.warn('[Overpass] all mirrors exhausted', { totalMs: Date.now() - requestStart, attempts });
    throw error;
  }
}

function mapOverpassElement(el, searchLat, searchLng) {
  const tags = el.tags || {};
  const name = tags.name || 'Unnamed place';
  if (name === 'Unnamed place') return null;

  const latCoord = el.type === 'node' ? el.lat : el.center?.lat;
  const lngCoord = el.type === 'node' ? el.lon : el.center?.lon;
  if (latCoord == null || lngCoord == null) return null;

  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean).join(', ');

  let category = 'restaurant';
  const amenity = tags.amenity;
  const shop = tags.shop;
  if (amenity === 'cafe' || shop === 'coffee') category = 'cafe';
  else if (amenity === 'bar' || amenity === 'pub') category = 'rooftop';
  else if (amenity === 'ice_cream' || shop === 'bakery') category = 'dessert';

  const cuisine = tags.cuisine || '';
  const distanceKm = haversine(searchLat, searchLng, latCoord, lngCoord);

  return {
    id: `${el.type}/${el.id}`,
    name,
    address,
    lat: latCoord,
    lng: lngCoord,
    rating: 4.5,
    totalRatings: 0,
    priceLevel: 2,
    photoUrl: null,
    types: [category],
    openNow: true,
    distance: Math.round(distanceKm * 1000) / 1000,
    category,
    cuisine,
    vibe: 'First Date Friendly',
    tags,
  };
}

async function searchPlacesOverpass({
  lat,
  lng,
  radius,
  keyword = '',
  category = 'all',
  cuisine = 'all',
}) {
  const cacheKey = buildCacheKey({ lat, lng, radius, category, cuisine, keyword });
  const filteredCached = filteredCache.get(cacheKey);
  if (
    filteredCached &&
    filteredCached.expiresAt > Date.now() &&
    filteredCached.data.results.length > 0
  ) {
    console.log('[Overpass] filtered cache hit', { cacheKey, resultCount: filteredCached.data.results.length });
    return {
      ...filteredCached.data,
      diagnostics: {
        ...(filteredCached.data.diagnostics || {}),
        filteredCacheHit: true,
        serverlessRuntime: SERVERLESS_RUNTIME,
      },
    };
  }

  // Negative cache check: skip the cascade entirely for recently-failed searches
  const rawKey = buildRawCacheKey({ lat, lng, radius, keyword });
  const negCached = negativeCache.get(rawKey);
  if (negCached && negCached.expiresAt > Date.now()) {
    console.log('[Overpass] negative cache hit — returning empty immediately', { rawKey });
    return {
      results: [],
      cuisineDataLimited: false,
      diagnostics: {
        source: 'negative_cache',
        mirror: null,
        attempts: negCached.attempts || [],
        filteredCacheHit: false,
        rawCacheHit: false,
        serverlessRuntime: SERVERLESS_RUNTIME,
      },
    };
  }

  console.log('[Overpass] filtered cache miss', { cacheKey });
  const searchStart = Date.now();
  const rawCached = rawCache.get(rawKey);

  let results = [];
  let mirrorUsed = null;
  let fetchDurationMs = 0;
  let attempts = [];
  let filteredCacheHit = false;
  let rawCacheHit = false;

  if (rawCached && rawCached.expiresAt > Date.now()) {
    results = rawCached.results;
    mirrorUsed = rawCached.mirror;
    fetchDurationMs = 0;
    attempts = rawCached.attempts || [];
    rawCacheHit = true;
    console.log('[Overpass] raw cache hit', { rawKey, resultCount: results.length });
  } else {
    console.log('[Overpass] raw cache miss', { rawKey });
    const seen = new Set();

    try {
      const query = buildOverpassQuery({ lat, lng, radius, keyword });
      const fetchResult = await fetchOverpassData(query);
      const { resp, endpoint, durationMs } = fetchResult;
      mirrorUsed = endpoint;
      fetchDurationMs = durationMs;
      attempts = fetchResult.attempts || [];
      const elements = resp?.data?.elements || [];

      for (const el of elements) {
        const place = mapOverpassElement(el, lat, lng);
        if (!place || seen.has(place.id)) continue;
        seen.add(place.id);
        results.push(place);
      }

      results.sort((a, b) => a.distance - b.distance);

      console.log('[Overpass] raw results fetched', {
        mirror: endpoint,
        durationMs,
        elementCount: elements.length,
        mappedCount: results.length,
        cuisineTagsFound: results.map(r => r.tags?.cuisine ?? r.cuisine ?? null),
      });

      if (results.length > 0) {
        rawCache.set(rawKey, {
          results,
          mirror: endpoint,
          attempts,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      } else {
        console.warn('[Overpass] empty raw result — not caching (mirror may have failed)');
      }
    } catch (e) {
      console.warn(`[Overpass] search failed: ${e.message}`, {
        totalMs: Date.now() - searchStart,
        attempts: e.attempts || attempts,
      });
      // Cache the failure so the same search doesn't re-trigger the full cascade
      negativeCache.set(rawKey, { attempts: e.attempts || attempts, expiresAt: Date.now() + NEGATIVE_CACHE_TTL_MS });
      return {
        results: [],
        cuisineDataLimited: false,
        diagnostics: {
          source: 'live_overpass_failed',
          mirror: null,
          attempts: e.attempts || attempts,
          filteredCacheHit: false,
          rawCacheHit: false,
          serverlessRuntime: SERVERLESS_RUNTIME,
        },
      };
    }
  }

  const filterResult = applyFilters(results, { category, cuisine });
  const payload = {
    results: filterResult.filtered,
    cuisineDataLimited: filterResult.cuisineDataLimited,
    diagnostics: {
      source: 'live_overpass',
      mirror: mirrorUsed,
      attempts,
      filteredCacheHit,
      rawCacheHit,
      serverlessRuntime: SERVERLESS_RUNTIME,
    },
  };

  console.log('[Overpass] search complete', {
    cacheKey,
    rawKey,
    mirror: mirrorUsed,
    fetchDurationMs,
    totalMs: Date.now() - searchStart,
    rawCount: results.length,
    filteredCount: payload.results.length,
    cuisineDataLimited: payload.cuisineDataLimited,
    distancesSample: payload.results.slice(0, 5).map(p => ({
      name: p.name,
      distanceKm: p.distance,
      lat: p.lat,
      lng: p.lng,
    })),
  });

  if (payload.results.length > 0) {
    filteredCache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
  } else {
    // Cache zero-filtered results negatively so re-searches in the same area
    // return immediately rather than re-triggering the full mirror cascade.
    console.warn('[Overpass] empty filtered result — caching negatively for', NEGATIVE_CACHE_TTL_MS / 1000, 's');
    negativeCache.set(rawKey, { attempts, expiresAt: Date.now() + NEGATIVE_CACHE_TTL_MS });
  }
  return payload;
}

async function getPlaceDetailsOverpass(osmId) {
  const [osmType, osmNumId] = osmId.split('/');
  const typeMap = { node: 'N', way: 'W', relation: 'R' };
  const osmTypeShort = typeMap[osmType] || 'N';

  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastNominatimCall));
  if (wait > 0) await sleep(wait);
  lastNominatimCall = Date.now();

  const resp = await axios.get(NOMINATIM_LOOKUP, {
    params: {
      osm_ids: `${osmTypeShort}${osmNumId}`,
      format: 'json',
      addressdetails: 1,
      extratags: 1,
      namedetails: 1,
    },
    headers: HEADERS,
    timeout: 8000,
  });

  const el = resp.data?.[0];
  if (!el) throw new Error('OSM element not found');

  const tags = el.extratags || {};
  const amenity = el.type || 'restaurant';

  return {
    id: osmId,
    name: el.name || el.namedetails?.name || 'Unnamed place',
    address: el.display_name?.split(',').slice(0, 3).join(',').trim() || '',
    lat: parseFloat(el.lat),
    lng: parseFloat(el.lon),
    rating: 4.5,
    totalRatings: 0,
    priceLevel: 2,
    photoUrl: null,
    types: [amenity],
    openNow: true,
    distance: null,
    category: amenity,
    cuisine: tags.cuisine || '',
    vibe: 'First Date Friendly',
    tags,
  };
}

module.exports = {
  searchPlacesOverpass,
  getPlaceDetailsOverpass,
  parseCuisineTags,
  matchesCuisine,
};
