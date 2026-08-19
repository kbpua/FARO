// Quick verification script for Overpass integration fixes
const { searchPlacesOverpass, matchesCuisine, parseCuisineTags } = require('./overpass');

const LAT = 14.5844;
const LNG = 121.0568;
const RADIUS = 5000;

async function timed(label, fn) {
  const start = Date.now();
  const result = await fn();
  const ms = Date.now() - start;
  console.log(`\n=== ${label} (${ms}ms) ===`);
  return { result, ms };
}

async function main() {
  console.log('Overpass integration verification\n');

  // 1. Cache + filter differentiation
  const all1 = await timed('All cuisines (cold)', () =>
    searchPlacesOverpass({ lat: LAT, lng: LNG, radius: RADIUS, category: 'all', cuisine: 'all' })
  );
  const all2 = await timed('All cuisines (cached)', () =>
    searchPlacesOverpass({ lat: LAT, lng: LNG, radius: RADIUS, category: 'all', cuisine: 'all' })
  );
  const korean1 = await timed('Korean filter (cold)', () =>
    searchPlacesOverpass({ lat: LAT, lng: LNG, radius: RADIUS, category: 'all', cuisine: 'korean' })
  );
  const cafe1 = await timed('Cafe category (cold)', () =>
    searchPlacesOverpass({ lat: LAT, lng: LNG, radius: RADIUS, category: 'cafe', cuisine: 'all' })
  );

  console.log('Result counts:', {
    allCold: all1.result.results.length,
    allCached: all2.result.results.length,
    korean: korean1.result.results.length,
    cafe: cafe1.result.results.length,
    cacheSpeedup: `${all1.ms}ms -> ${all2.ms}ms`,
    cuisineDataLimited: korean1.result.cuisineDataLimited,
  });

  // 2. Cuisine tag diagnostic
  const tagged = all1.result.results.filter(p => parseCuisineTags(p.cuisine).length > 0);
  console.log('\nCuisine tag coverage:', {
    total: all1.result.results.length,
    tagged: tagged.length,
    ratio: all1.result.results.length
      ? (tagged.length / all1.result.results.length).toFixed(2)
      : '0',
    sampleTags: tagged.slice(0, 8).map(p => ({ name: p.name, cuisine: p.cuisine })),
  });

  // 3. Distance variance
  const distances = all1.result.results.slice(0, 10).map(p => ({
    name: p.name,
    distanceKm: p.distance,
    lat: p.lat,
    lng: p.lng,
  }));
  const uniqueDistances = new Set(distances.map(d => d.distanceKm));
  console.log('\nDistance sample (first 10):', distances);
  console.log('Unique distance values in sample:', uniqueDistances.size);

  // 4. Cuisine matcher unit checks
  console.log('\nCuisine matcher checks:', {
    koreanMatch: matchesCuisine('korean;bbq', 'korean'),
    italianMismatch: matchesCuisine('italian', 'korean'),
    missingTag: matchesCuisine('', 'korean'),
    semicolon: matchesCuisine('asian;korean', 'korean'),
  });

  console.log('\nVerification complete.');
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
