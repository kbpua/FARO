export interface RecommendedLocation {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  category: string;
  tag: string;
  zoomLevel?: number;
}

export const POPULAR_DATE_HUBS: RecommendedLocation[] = [
  {
    id: 'sm_megamall',
    name: 'SM Megamall',
    subtitle: 'EDSA cor. Doña Julia Vargas Ave, Ortigas Center, Mandaluyong',
    lat: 14.5844,
    lng: 121.0568,
    category: 'Mall & Dining Hub',
    tag: '🛍️ Mall Dining',
    zoomLevel: 16,
  },
  {
    id: 'bgc_high_street',
    name: 'Bonifacio High Street (BGC)',
    subtitle: '5th Ave, Bonifacio Global City, Taguig',
    lat: 14.5517,
    lng: 121.0504,
    category: 'Open-Air Promenade',
    tag: '✨ Romantic Walk',
    zoomLevel: 16,
  },
  {
    id: 'greenbelt_makati',
    name: 'Greenbelt Ayala Center',
    subtitle: 'Esperanza St, Legazpi Village, Makati',
    lat: 14.5526,
    lng: 121.0205,
    category: 'Garden Dining & Bistros',
    tag: '🌿 Garden Patio',
    zoomLevel: 16,
  },
  {
    id: 'power_plant_mall',
    name: 'Power Plant Mall (Rockwell)',
    subtitle: 'Rockwell Center, Makati City',
    lat: 14.5654,
    lng: 121.0366,
    category: 'Upscale Lifestyle Mall',
    tag: '🍸 Cozy & Intimate',
    zoomLevel: 16,
  },
  {
    id: 'the_podium',
    name: 'The Podium',
    subtitle: '18 ADB Ave, Ortigas Center, Mandaluyong',
    lat: 14.5855,
    lng: 121.0589,
    category: 'Gourmet Dining & Lounges',
    tag: '🍽️ Fine Dining',
    zoomLevel: 16,
  },
  {
    id: 'shangrila_plaza',
    name: 'Shangri-La Plaza',
    subtitle: 'EDSA cor. Shaw Blvd, Mandaluyong',
    lat: 14.5818,
    lng: 121.0545,
    category: 'Quiet Luxury Dining',
    tag: '🕯️ Dim & Quiet',
    zoomLevel: 16,
  },
  {
    id: 'ayala_malls_manila_bay',
    name: 'Ayala Malls Manila Bay',
    subtitle: 'Aseana Ave, Parañaque City',
    lat: 14.5242,
    lng: 120.9898,
    category: 'Waterfront Mall Terraces',
    tag: '🌅 Sunset View',
    zoomLevel: 15,
  },
  {
    id: 'sm_mall_of_asia',
    name: 'SM Mall of Asia (MOA)',
    subtitle: 'Seaside Blvd, Pasay City',
    lat: 14.5353,
    lng: 120.9822,
    category: 'Bayfront & Seaside Dining',
    tag: '🎡 Seaside Date',
    zoomLevel: 15,
  },
  {
    id: 'eastwood_city',
    name: 'Eastwood City Walk',
    subtitle: 'Bagumbayan, Quezon City',
    lat: 14.6102,
    lng: 121.0805,
    category: 'Vibrant Nightlife & Cafes',
    tag: '🎶 Lively & Fun',
    zoomLevel: 16,
  },
  {
    id: 'trinoma_vertis',
    name: 'TriNoma & Vertis North',
    subtitle: 'North Ave, Quezon City',
    lat: 14.6534,
    lng: 121.0336,
    category: 'Rooftop Gardens & Dining',
    tag: '🛍️ Mall Dining',
    zoomLevel: 16,
  },
  {
    id: 'alabang_town_center',
    name: 'Alabang Town Center (ATC)',
    subtitle: 'Alabang-Zapote Rd, Muntinlupa City',
    lat: 14.4239,
    lng: 121.0305,
    category: 'Courtyards & Open Cafes',
    tag: '☕ Cozy Cafes',
    zoomLevel: 16,
  },
  {
    id: 'up_town_center',
    name: 'U.P. Town Center',
    subtitle: 'Katipunan Ave, Diliman, Quezon City',
    lat: 14.6508,
    lng: 121.0747,
    category: 'Casual Cafes & Dining',
    tag: '❤️ First Date',
    zoomLevel: 16,
  },
];

export function getMatchingRecommendations(query: string): RecommendedLocation[] {
  if (!query || !query.trim()) {
    return POPULAR_DATE_HUBS.slice(0, 6);
  }
  
  const q = query.toLowerCase().trim();
  const matched = POPULAR_DATE_HUBS.filter((loc) => 
    loc.name.toLowerCase().includes(q) ||
    loc.subtitle.toLowerCase().includes(q) ||
    loc.category.toLowerCase().includes(q)
  );

  return matched;
}
