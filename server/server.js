// server.js - Faro API Proxy & Foursquare / Google Places Service
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { generateMockPlaces, getMockPlaceDetails } = require('./mockData');
const { getPlaceImage, getPlaceholder } = require('./imageService');
const { searchPlacesOverpass, getPlaceDetailsOverpass } = require('./overpass');

const app = express();

app.use(cors());
app.use(express.json());

const IMAGE_LOOKUP_CONCURRENCY = 2;

async function attachImages(places, maxLookups, getPlaceImageFn, getPlaceholderFn, logContext = 'unknown') {
  const imageDiagnostics = [];
  const attachStarted = Date.now();

  async function attachOne(p, i) {
    if (i < maxLookups) {
      try {
        const img = await getPlaceImageFn(p);
        p.imageUrl = img.imageUrl;
        p.imageSource = img.imageSource;
        imageDiagnostics.push({
          placeId: p.id,
          placeName: p.name,
          attemptedLookup: true,
          result: img.imageSource === 'placeholder' ? 'no_photo_placeholder' : 'photo_found',
          imageSource: img.imageSource,
        });
      } catch (err) {
        const placeholder = getPlaceholderFn(p.cuisine);
        p.imageUrl = placeholder.imageUrl;
        p.imageSource = placeholder.imageSource;
        imageDiagnostics.push({
          placeId: p.id,
          placeName: p.name,
          attemptedLookup: true,
          result: 'lookup_error',
          error: err.message,
          imageSource: 'placeholder',
        });
      }
    } else {
      const placeholder = getPlaceholderFn(p.cuisine);
      p.imageUrl = placeholder.imageUrl;
      p.imageSource = placeholder.imageSource;
      imageDiagnostics.push({
        placeId: p.id,
        placeName: p.name,
        attemptedLookup: false,
        result: 'skipped_lookup_placeholder',
        imageSource: 'placeholder',
      });
    }
  }

  for (let i = 0; i < places.length; i += IMAGE_LOOKUP_CONCURRENCY) {
    const batch = places.slice(i, i + IMAGE_LOOKUP_CONCURRENCY);
    await Promise.all(batch.map((p, batchIdx) => attachOne(p, i + batchIdx)));
  }
  console.log('[ImageLookup] batch summary', {
    context: logContext,
    totalPlaces: places.length,
    elapsedMs: Date.now() - attachStarted,
    lookupsAttempted: imageDiagnostics.filter((d) => d.attemptedLookup).length,
    byResult: imageDiagnostics.reduce((acc, item) => {
      acc[item.result] = (acc[item.result] || 0) + 1;
      return acc;
    }, {}),
    sample: imageDiagnostics.slice(0, 8),
  });
  return imageDiagnostics;
}

// Helper: Calculate distance between two coordinates (Haversine formula in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Helper: Extract pros from reviews
function extractPros(reviews = []) {
  const keywords = ['great', 'amazing', 'excellent', 'good', 'perfect', 'love', 'best', 'beautiful', 'friendly', 'delicious', 'clean', 'spacious', 'romantic', 'cozy', 'quiet', 'aesthetic'];
  const pros = [];
  reviews.forEach(review => {
    if (!review.text) return;
    const words = review.text.toLowerCase().split(/\s+/);
    words.forEach((word, index) => {
      if (keywords.includes(word) && index < words.length - 1) {
        const phrase = words.slice(index, Math.min(index + 4, words.length)).join(' ');
        if (phrase.length > 8 && phrase.length < 40) pros.push(phrase);
      }
    });
  });
  return [...new Set(pros)].slice(0, 5);
}

// Helper: Extract cons from reviews
function extractCons(reviews = []) {
  const keywords = ['bad', 'terrible', 'poor', 'disappointing', 'expensive', 'slow', 'cold', 'dirty', 'small', 'loud', 'crowded', 'noisy', 'rude', 'wait'];
  const cons = [];
  reviews.forEach(review => {
    if (!review.text) return;
    const words = review.text.toLowerCase().split(/\s+/);
    words.forEach((word, index) => {
      if (keywords.includes(word) && index < words.length - 1) {
        const phrase = words.slice(index, Math.min(index + 4, words.length)).join(' ');
        if (phrase.length > 8 && phrase.length < 40) cons.push(phrase);
      }
    });
  });
  return [...new Set(cons)].slice(0, 5);
}

// Foursquare Category IDs Taxonomy
const FSQ_CATEGORIES = {
  cafe: '13032,13034,13035', // Coffee Shop, Cafe, Tea Room
  restaurant: '13065',       // Restaurant
  rooftop: '13003,13018,13025,13029', // Bar, Lounge, Rooftop Bar, Speakeasy
  dessert: '13038,13002,13040', // Dessert Shop, Bakery, Ice Cream
  mall: '17114',             // Shopping Mall
};

// Foursquare Cuisine IDs Taxonomy
const FSQ_CUISINES = {
  filipino: '13165',
  italian: '13236',
  japanese: '13263',
  korean: '13289',
  american: '13068',
  chinese: '13099',
  mediterranean: '13309',
  mexican: '13303',
  cafe_bakery: '13032,13002',
};

// Map Foursquare category to Faro category
function mapFsqCategoryToFaro(categories = []) {
  if (!categories || categories.length === 0) return 'restaurant';
  const name = (categories[0].name || '').toLowerCase();
  const id = String(categories[0].id || '');

  if (id === '13032' || id === '13034' || name.includes('coffee') || name.includes('cafe')) return 'cafe';
  if (id === '13003' || id === '13018' || id === '13025' || name.includes('bar') || name.includes('lounge')) return 'rooftop';
  if (id === '13038' || id === '13040' || id === '13002' || name.includes('dessert') || name.includes('bakery') || name.includes('ice cream')) return 'dessert';
  if (id === '17114' || name.includes('mall')) return 'mall';
  return 'restaurant';
}

// 1. Search Places (priority: OSM → Foursquare → Google)
async function handlePlacesSearch(req, res) {
  const {
    lat,
    lng,
    radius,
    category,
    type,
    cuisine,
    occasion,
    minRating,
    priceLevels,
    onlyOpenNow,
    keyword,
    query,
  } = req.query;

  const latitude = parseFloat(lat) || 14.5844;
  const longitude = parseFloat(lng) || 121.0568;
  const searchRadius = parseInt(radius, 10) || 5000;
  const activeCategory = category || type || 'all';

  const fsqApiKey = process.env.FOURSQUARE_API_KEY;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
  // Quick mitigation: avoid hammering Wikimedia/Unsplash by only fetching
  // "real" images for a small number of results per request.
  const MAX_IMAGE_LOOKUPS = 8;

  // A. OpenStreetMap (primary)
  let results = [];
  let cuisineDataLimited = false;
  let responseSource = 'curated_mock';
  let responseDiagnostics = {
    source: 'curated_mock',
    mirror: null,
    attempts: [],
    filteredCacheHit: false,
    rawCacheHit: false,
    serverlessRuntime: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
    imageLookup: [],
    fallbackReason: null,
  };
  try {
    const overpassPayload = await searchPlacesOverpass({
      lat: latitude,
      lng: longitude,
      radius: searchRadius,
      keyword: keyword || query || '',
      category: activeCategory,
      cuisine: cuisine || 'all',
    });
    const osmResults = overpassPayload.results || [];
    cuisineDataLimited = Boolean(overpassPayload.cuisineDataLimited);
    responseDiagnostics = {
      ...responseDiagnostics,
      ...(overpassPayload.diagnostics || {}),
    };
    osmResults.forEach(p => (p.source = 'OpenStreetMap'));
    responseDiagnostics.imageLookup = await attachImages(
      osmResults,
      MAX_IMAGE_LOOKUPS,
      getPlaceImage,
      getPlaceholder,
      'overpass'
    );
    results = osmResults;
    if (osmResults.length > 0) {
      responseSource = 'live_overpass';
      responseDiagnostics.source = 'live_overpass';
    } else {
      responseDiagnostics.fallbackReason = 'overpass_returned_zero_results';
    }
  } catch (e) {
    console.warn('[Overpass Search Error]:', e.message);
    responseDiagnostics.fallbackReason = `overpass_error:${e.message}`;
  }

  // B. Foursquare (fallback if <5 results)
  if (results.length < 5 && fsqApiKey) {
    try {
      let categories = [];
      if (activeCategory && activeCategory !== 'all' && FSQ_CATEGORIES[activeCategory]) {
        categories.push(FSQ_CATEGORIES[activeCategory]);
      }
      if (cuisine && cuisine !== 'all' && FSQ_CUISINES[cuisine]) {
        categories.push(FSQ_CUISINES[cuisine]);
      }
      let searchTerm = keyword || query || '';
      if (occasion && occasion !== 'all') {
        searchTerm += ` ${occasion.replace('_', ' ')}`;
      }
      const params = {
        ll: `${latitude},${longitude}`,
        radius: searchRadius,
        fields: 'fsq_id,name,location,geocodes,categories,rating,stats,price,photos,tips,hours,tel,website,description',
        limit: 35,
        sort: 'DISTANCE',
      };
      if (categories.length > 0) params.categories = categories.join(',');
      if (searchTerm.trim()) params.query = searchTerm.trim();
      if (minRating && parseFloat(minRating) > 0) params.min_price = 1;
      if (onlyOpenNow === 'true' || onlyOpenNow === true) params.open_now = true;

      const response = await axios.get('https://places-api.foursquare.com/places/search', {
        headers: { Authorization: `Bearer ${fsqApiKey}`, 'X-Places-Api-Version': '2025-06-17', Accept: 'application/json' },
        params,
        timeout: 10000,
      });

      const fsqPlaces = (response.data?.results || []).map(item => {
        const placeLat = item.geocodes?.main?.latitude || latitude;
        const placeLng = item.geocodes?.main?.longitude || longitude;
        const dist = item.distance ? +(item.distance / 1000).toFixed(2) : calculateDistance(latitude, longitude, placeLat, placeLng);
        const rating = item.rating ? +(item.rating / 2).toFixed(1) : 4.5;
        const totalRatings = item.stats?.total_ratings || item.stats?.total_photos || 50;
        let photoUrl = null;
        if (item.photos && item.photos.length > 0) {
          const p = item.photos[0];
          photoUrl = `${p.prefix}800x600${p.suffix}`;
        }
        const placeCategory = mapFsqCategoryToFaro(item.categories);
        const address = item.location?.formatted_address || item.location?.address || '';
        return {
          id: item.fsq_id,
          name: item.name,
          address,
          lat: placeLat,
          lng: placeLng,
          rating,
          totalRatings,
          priceLevel: item.price || 2,
          photoUrl,
          types: item.categories?.map(c => c.name.toLowerCase()) || [],
          openNow: item.hours?.is_open_now ?? true,
          distance: dist,
          category: placeCategory,
          vibe: item.price && item.price > 2 ? 'Special Occasion' : 'First Date Friendly',
        };
      });
      fsqPlaces.forEach(p => (p.source = 'Foursquare'));
      responseDiagnostics.imageLookup = await attachImages(
        fsqPlaces,
        MAX_IMAGE_LOOKUPS,
        getPlaceImage,
        getPlaceholder,
        'foursquare'
      );
      results = results.concat(fsqPlaces);
      if (results.length > 0) {
        responseSource = 'live_foursquare';
        responseDiagnostics.source = 'live_foursquare';
      }
    } catch (err) {
      console.warn('[Foursquare API Error]:', err.message);
    }
  }

  // C. Google (fallback if still <5 results)
  if (results.length < 5 && googleApiKey) {
    try {
      let searchTerm = keyword || query || '';
      if (cuisine && cuisine !== 'all') searchTerm += ` ${cuisine} food`;
      if (occasion && occasion !== 'all') searchTerm += ` ${occasion.replace('_', ' ')}`;
      const params = { location: `${latitude},${longitude}`, radius: searchRadius, key: googleApiKey };
      if (searchTerm.trim()) params.keyword = searchTerm.trim();

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { params, timeout: 10000 });

      const googlePlaces = (response.data.results || []).map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating || 4.5,
        totalRatings: place.user_ratings_total || 50,
        priceLevel: place.price_level || 2,
        photoUrl: place.photos?.[0]?.photo_reference ? `/api/places/photo?photoRef=${place.photos[0].photo_reference}&maxWidth=600` : null,
        types: place.types || [],
        openNow: place.opening_hours?.open_now ?? true,
        distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
        category: activeCategory === 'all' ? 'restaurant' : activeCategory,
        vibe: place.price_level > 2 ? 'Special Occasion' : 'First Date Friendly',
      }));
      googlePlaces.forEach(p => (p.source = 'Google'));
      responseDiagnostics.imageLookup = await attachImages(
        googlePlaces,
        MAX_IMAGE_LOOKUPS,
        getPlaceImage,
        getPlaceholder,
        'google'
      );
      results = results.concat(googlePlaces);
      if (results.length > 0) {
        responseSource = 'live_google';
        responseDiagnostics.source = 'live_google';
      }
    } catch (err) {
      console.warn('[Google Places API Error]:', err.message);
    }
  }

  // D. Mock fallback if still empty
  if (results.length === 0) {
    const mockResults = generateMockPlaces(
      latitude,
      longitude,
      searchRadius / 1000,
      activeCategory === 'all' ? null : activeCategory,
      keyword || query,
      cuisine,
      occasion
    );
    mockResults.forEach(p => {
      p.source = 'Mock';
      p.imageSource = 'placeholder';
    });
    results = mockResults;
    responseSource = 'curated_mock';
    responseDiagnostics.source = 'curated_mock';
    responseDiagnostics.imageLookup = mockResults.slice(0, 8).map((p) => ({
      placeId: p.id,
      placeName: p.name,
      attemptedLookup: false,
      result: 'mock_placeholder',
      imageSource: 'placeholder',
    }));
  }

  // Filters
  if (minRating && parseFloat(minRating) > 0) {
    results = results.filter(p => p.rating >= parseFloat(minRating));
  }
  if (onlyOpenNow === 'true' || onlyOpenNow === true) {
    results = results.filter(p => p.openNow);
  }

  console.log('[PlacesAPI] response summary', {
    source: responseSource,
    resultCount: results.length,
    cuisineDataLimited,
    diagnostics: responseDiagnostics,
  });

  return res.json({
    success: true,
    mode: 'live',
    source: responseSource,
    results,
    cuisineDataLimited,
    diagnostics: responseDiagnostics,
  });
}

// Places Search Routes
app.get('/api/places', handlePlacesSearch);
app.get('/api/places/search', handlePlacesSearch);
app.get('/api/places/nearby', handlePlacesSearch);

// Image lookup endpoint
app.get('/api/places/image', async (req, res) => {
  const { placeId, name, cuisine, osmNodeId } = req.query;
  if (!placeId && !name) {
    return res.status(400).json({ success: false, error: 'placeId or name required' });
  }
  try {
    console.log('[ImageEndpoint] request', {
      placeId: placeId || null,
      osmNodeId: osmNodeId || null,
      name: name || null,
      cuisine: cuisine || null,
    });
    const place = {
      id: placeId || osmNodeId || name,
      name: name || '',
      cuisine: cuisine || '',
      tags: {},
    };
    if (osmNodeId) {
      const overpassResp = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: `[out:json];node(${osmNodeId});out body;` },
        timeout: 8000,
      });
      console.log('[ImageEndpoint] node tag lookup', {
        osmNodeId,
        status: overpassResp.status,
        elementCount: overpassResp.data?.elements?.length || 0,
      });
      const node = overpassResp.data?.elements?.[0];
      if (node?.tags) {
        place.tags = node.tags;
        place.name = place.name || node.tags.name || '';
        place.cuisine = place.cuisine || node.tags.cuisine || '';
      }
    }
    const result = await getPlaceImage(place);
    console.log('[ImageEndpoint] result', {
      id: place.id,
      imageSource: result.imageSource,
      hasImageUrl: Boolean(result.imageUrl),
    });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Image Endpoint Error]:', err.message);
    res.status(500).json({ success: false, error: 'Image lookup failed' });
  }
});

// 2. Place Details Route (Supports Foursquare fsq_id & Google Place ID)
app.get('/api/places/details', async (req, res) => {
  const { placeId, lat, lng, placeName, placeAddress } = req.query;
  const fsqApiKey = process.env.FOURSQUARE_API_KEY;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

  // A. Foursquare Place Details
  if (fsqApiKey && placeId && !placeId.startsWith('mock_place_')) {
    try {
      const [placeRes, tipsRes, photosRes] = await Promise.allSettled([
        axios.get(`https://places-api.foursquare.com/places/${placeId}`, {
          headers: {
            Authorization: `Bearer ${fsqApiKey}`,
            'X-Places-Api-Version': '2025-06-17',
            Accept: 'application/json',
          },
          params: {
            fields:
              'fsq_id,name,location,geocodes,categories,rating,stats,price,photos,tips,hours,tel,website,description',
          },
          timeout: 8000,
        }),
        axios.get(`https://places-api.foursquare.com/places/${placeId}/tips`, {
          headers: {
            Authorization: `Bearer ${fsqApiKey}`,
            'X-Places-Api-Version': '2025-06-17',
            Accept: 'application/json',
          },
          params: { limit: 6, sort: 'POPULAR' },
          timeout: 8000,
        }),
        axios.get(`https://places-api.foursquare.com/places/${placeId}/photos`, {
          headers: {
            Authorization: `Bearer ${fsqApiKey}`,
            'X-Places-Api-Version': '2025-06-17',
            Accept: 'application/json',
          },
          params: { limit: 8 },
          timeout: 8000,
        }),
      ]);

      if (placeRes.status === 'fulfilled' && placeRes.value.data) {
        const place = placeRes.value.data;
        const tips = tipsRes.status === 'fulfilled' ? tipsRes.value.data || [] : [];
        const photosList = photosRes.status === 'fulfilled' ? photosRes.value.data || [] : [];

        const photos = photosList.map(p => `${p.prefix}800x600${p.suffix}`);
        const reviews = tips.map(t => ({
          author: 'Foursquare Member',
          rating: 5,
          text: t.text,
          time: new Date(t.created_at).getTime() / 1000,
          profilePhoto: null,
          relativeTime: 'Recent tip',
        }));

        const establishmentQuery = encodeURIComponent(
          `${place.name}, ${place.location?.formatted_address || place.location?.address || ''}`
        );

        return res.json({
          success: true,
          mode: 'live_foursquare',
          details: {
            id: place.fsq_id,
            name: place.name,
            address: place.location?.formatted_address || place.location?.address || '',
            phone: place.tel || null,
            website: place.website || null,
            rating: place.rating ? +(place.rating / 2).toFixed(1) : 4.8,
            totalRatings: place.stats?.total_ratings || 50,
            priceLevel: place.price || 2,
            openingHours: place.hours?.display?.split(';') || [
              'Monday – Sunday: 10:00 AM – 10:00 PM',
            ],
            photos: photos,
            reviews: reviews,
            types: place.categories?.map(c => c.name) || [],
            googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${establishmentQuery}`,
            pros: extractPros(reviews),
            cons: extractCons(reviews),
            ambianceOverview: {
              lighting: 'Warm Ambient Lighting',
              noiseLevel: 'Moderate & Relaxed',
              seatingStyle: 'Cozy tables, booths & lounge seating',
              bestFor: 'Dates, Dinners & Gatherings',
              music: 'Curated background music',
              dressCode: place.price && place.price > 2 ? 'Smart Casual' : 'Casual',
            },
          },
        });
      }
    } catch (fsqErr) {
      console.warn('[Foursquare Details Error]:', fsqErr.message);
    }
  }

  // --- D. OpenStreetMap Overpass fallback for place details
try {
  const overpassDetails = await getPlaceDetailsOverpass(placeId);
  return res.json({
    success: true,
    mode: 'live_overpass',
    details: overpassDetails,
  });
} catch (overpassErr) {
  console.warn('[Overpass Details Error]:', overpassErr.message);
}

// B. Fallback to Curated Details
  const details = getMockPlaceDetails(
    placeId,
    parseFloat(lat) || 14.5844,
    parseFloat(lng) || 121.0568,
    placeName,
    placeAddress
  );

  res.json({
    success: true,
    mode: 'curated_mock',
    details,
  });
});

// 3. Place Photos Proxy (for Google Places photos)
app.get('/api/places/photo', async (req, res) => {
  const { photoRef, maxWidth } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || !photoRef) {
    return res.redirect(
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    );
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/photo',
      {
        params: {
          photoreference: photoRef,
          maxwidth: maxWidth || 600,
          key: apiKey,
        },
        responseType: 'stream',
        timeout: 10000,
      }
    );

    response.data.pipe(res);
  } catch (error) {
    res.redirect(
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    );
  }
});

// 4. Geocoding Route
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query;

  if (!address || !address.trim()) {
    return res.status(400).json({ success: false, error: 'Address parameter required' });
  }

  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address.trim(),
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'FaroApp/2.0 (contact: info@faro.local)',
        },
        timeout: 8000,
      }
    );

    if (response.data && response.data.length > 0) {
      const results = response.data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        city:
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.address?.state ||
          '',
      }));

      res.json({
        success: true,
        lat: results[0].lat,
        lng: results[0].lng,
        displayName: results[0].displayName,
        results: results,
      });
    } else {
      res.json({ success: false, error: 'Location not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ success: false, error: 'Geocoding request failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Faro',
    timestamp: new Date().toISOString(),
    hasFoursquareApiKey: Boolean(process.env.FOURSQUARE_API_KEY),
    hasGoogleApiKey: Boolean(process.env.GOOGLE_PLACES_API_KEY),
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✨ Faro API Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
