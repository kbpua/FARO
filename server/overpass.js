// overpass.js - OpenStreetMap data via Photon (Komoot) geocoder
// Free, no API key, same OSM data as Overpass/Nominatim
const axios = require('axios');

const PHOTON_URL = 'https://photon.komoot.io/api/';
const NOMINATIM_LOOKUP = 'https://nominatim.openstreetmap.org/lookup';
const HEADERS = { 'User-Agent': 'FaroApp/2.0 (contact: info@faro.local)' };

const AMENITY_TAGS = ['restaurant', 'cafe', 'fast_food', 'bar', 'pub'];

// Results cache: keyed by lat/lng/radius, 2-min TTL
const searchCache = new Map();
let lastNominatimCall = 0;

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

function mapPhotonPlace(feature, searchLat, searchLng) {
  const props = feature.properties || {};
  const [lng, lat] = feature.geometry?.coordinates || [searchLng, searchLat];
  const dist = haversine(searchLat, searchLng, lat, lng);
  const amenity = props.osm_value || props.osm_key || 'restaurant';

  return {
    id: `${props.osm_type || 'node'}/${props.osm_id}`,
    name: props.name || 'Unnamed place',
    address: [props.street, props.housenumber, props.city, props.state]
      .filter(Boolean)
      .join(', '),
    lat,
    lng,
    rating: 4.5,
    totalRatings: 0,
    priceLevel: 2,
    photoUrl: null,
    types: [amenity],
    openNow: true,
    distance: Math.round(dist * 100) / 100,
    category:
      amenity === 'cafe' ? 'cafe' :
      amenity === 'bar' || amenity === 'pub' ? 'rooftop' :
      'restaurant',
    cuisine: '',
    vibe: 'First Date Friendly',
    tags: {},
  };
}

async function searchPlacesOverpass({ lat, lng, radius }) {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const radiusKm = radius / 1000;
  const seen = new Set();
  const results = [];

  try {
    const resp = await axios.get(PHOTON_URL, {
      params: {
        q: 'food drink',
        lat,
        lon: lng,
        limit: 80,
        osm_tag: 'amenity',
        zoom: 14,
        location_bias_scale: 0.8,
      },
      timeout: 10000,
    });

    const features = resp.data?.features || [];
    for (const f of features) {
      const place = mapPhotonPlace(f, lat, lng);
      const amenity = String(f?.properties?.osm_value || place.types?.[0] || '').toLowerCase();
      if (!AMENITY_TAGS.includes(amenity)) continue;

      if (place.distance <= radiusKm && !seen.has(place.id) && place.name !== 'Unnamed place') {
        seen.add(place.id);
        results.push(place);
      }
    }
  } catch (e) {
    console.warn(`[Photon] search failed: ${e.message}`);
  }

  results.sort((a, b) => a.distance - b.distance);
  searchCache.set(cacheKey, { data: results, expiresAt: Date.now() + 120000 });
  return results;
}

async function getPlaceDetailsOverpass(osmId) {
  const [osmType, osmNumId] = osmId.split('/');
  const typeMap = { node: 'N', way: 'W', relation: 'R' };
  const osmTypeShort = typeMap[osmType] || 'N';

  // Rate-limit Nominatim lookups
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
};
