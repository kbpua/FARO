// imageService.js - Handles image lookup for places (OSM, Wikimedia, Unsplash, placeholders)
const fetch = require('node-fetch');
const cache = new Map();

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry;
  cache.delete(key);
  return null;
}
function setCache(key, data) {
  cache.set(key, { ...data, expiresAt: Date.now() + 60 * 60 * 1000 });
  return data;
}

function getOSMImage(place) {
  if (place.tags && place.tags.image) {
    return { imageUrl: place.tags.image, imageSource: 'OSM' };
  }
  return null;
}

function getWikimediaTagImage(place) {
  if (place.tags && place.tags.wikimedia_commons) {
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${place.tags.wikimedia_commons}`;
    return { imageUrl: url, imageSource: 'Wikimedia' };
  }
  return null;
}

async function searchWikimedia(name, cuisine) {
  const q = encodeURIComponent(`${name} ${cuisine || ''} restaurant`);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*`;
  try {
    const resp = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'FaroApp/2.0 (https://faro.local; info@faro.local)' },
    });
    const data = await resp.json();
    const title = data?.query?.search?.[0]?.title;
    if (title) {
      const clean = title.replace(/^File:/i, '');
      const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(clean)}`;
      return { imageUrl: imgUrl, imageSource: 'Wikimedia' };
    }
  } catch (e) {
    console.warn('Wikimedia search error:', e.message);
  }
  return null;
}

async function searchUnsplash(name) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const q = encodeURIComponent(`${name} restaurant`);
  const url = `https://api.unsplash.com/search/photos?query=${q}&per_page=1&client_id=${accessKey}`;
  try {
    const resp = await fetchWithTimeout(url);
    const data = await resp.json();
    if (data.results?.[0]?.urls?.regular) {
      return { imageUrl: data.results[0].urls.regular, imageSource: 'Unsplash' };
    }
  } catch (e) {
    console.warn('Unsplash error:', e.message);
  }
  return null;
}

function getPlaceholder(cuisine) {
  const map = {
    italian: '\u{1F35D}', japanese: '\u{1F363}', mexican: '\u{1F32E}', chinese: '\u{1F962}', indian: '\u{1F35B}',
    thai: '\u{1F35C}', american: '\u{1F354}', french: '\u{1F956}', seafood: '\u{1F99E}', vegan: '\u{1F957}',
  };
  const emoji = map[(cuisine || '').toLowerCase()] || '\u{1F37D}\uFE0F';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return { imageUrl: dataUri, imageSource: 'placeholder' };
}

async function getPlaceImage(place) {
  const cacheKey = `img:${place.id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  let result = getOSMImage(place);
  if (result) return setCache(cacheKey, result);

  result = getWikimediaTagImage(place);
  if (result) return setCache(cacheKey, result);

  result = await searchWikimedia(place.name, place.cuisine);
  if (result) return setCache(cacheKey, result);

  result = await searchUnsplash(place.name);
  if (result) return setCache(cacheKey, result);

  result = getPlaceholder(place.cuisine);
  return setCache(cacheKey, result);
}

module.exports = { getPlaceImage, getPlaceholder };
