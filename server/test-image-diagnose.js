const axios = require('axios');
const { searchPlacesOverpass } = require('./overpass');
const { getPlaceImage } = require('./imageService');

async function run() {
  const lat = 14.5844;
  const lng = 121.0568;
  const radius = 5000;

  const first = await searchPlacesOverpass({ lat, lng, radius, category: 'all', cuisine: 'all' });
  const second = await searchPlacesOverpass({ lat, lng, radius, category: 'all', cuisine: 'all' });

  console.log('counts:', first.results.length, second.results.length);
  const sample = first.results.slice(0, 12);
  console.log('sample ids:', sample.map((p) => p.id));
  console.log('valid ids:', sample.map((p) => /^node\/\d+$|^way\/\d+$/.test(p.id)));
  console.log('tags in first/cached:', Boolean(first.results[0]?.tags), Boolean(second.results[0]?.tags));
  console.log('sample keys:', Object.keys(first.results[0] || {}));

  const imageProbe = [];
  for (const place of sample.slice(0, 8)) {
    const img = await getPlaceImage(place);
    imageProbe.push({
      id: place.id,
      name: place.name,
      imageSource: img.imageSource,
      urlPreview: String(img.imageUrl || '').slice(0, 100),
    });
  }
  console.log('getPlaceImage probe:', imageProbe);

  const firstNode = sample.find((p) => p.id.startsWith('node/'));
  if (firstNode) {
    const nodeId = firstNode.id.split('/')[1];
    try {
      const overpassResp = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: `[out:json];node(${nodeId});out body;` },
        timeout: 8000,
        validateStatus: () => true,
      });
      console.log('single-node overpass:', {
        nodeId,
        status: overpassResp.status,
        elements: overpassResp.data?.elements?.length || 0,
        tags: overpassResp.data?.elements?.[0]?.tags || null,
      });
    } catch (err) {
      console.log('single-node overpass error:', {
        nodeId,
        code: err.code || err.message,
      });
    }
  }

  const wikimediaProbe = await Promise.all(
    sample.slice(0, 5).map(async (place) => {
      const q = encodeURIComponent(`${place.name} ${place.cuisine || ''} restaurant`);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&origin=*`;
      const started = Date.now();
      try {
        const resp = await axios.get(url, {
          timeout: 2500,
          validateStatus: () => true,
          headers: { 'User-Agent': 'FaroDiag/1.0' },
        });
        return {
          name: place.name,
          status: resp.status,
          elapsedMs: Date.now() - started,
          topTitle: resp.data?.query?.search?.[0]?.title || null,
        };
      } catch (err) {
        return {
          name: place.name,
          error: err.code || err.message,
          elapsedMs: Date.now() - started,
        };
      }
    })
  );
  console.log('wikimedia probe:', wikimediaProbe);

  if (sample.length > 0) {
    console.log('sample tag presence:', sample.map((place) => ({
      id: place.id,
      name: place.name,
      hasTags: Boolean(place.tags),
      wikimediaCommons: place.tags?.wikimedia_commons || null,
      image: place.tags?.image || null,
    })));
  }
}

run().catch((err) => {
  console.error('diagnostic failed:', err);
  process.exit(1);
});
