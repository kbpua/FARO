// Curated high quality date spots database and coordinate-based generator
// for fallback / demo mode when Google Places API key is not configured.

const DATE_CATEGORIES = {
  cafe: {
    names: ['The Velvet Bean Coffee & Bakery', 'Luna & Botanica Cafe', 'Artisan Roastery & Lounge', 'Serenade Espresso Bar', 'The Cozy Nook Cafe', 'Petal & Pastry Tearoom', 'Starlight Coffee House', 'Midnight Drip & Dessert'],
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
    ],
    ambiancePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        caption: 'Warm wooden interior with soft hanging Edison bulbs and cozy armchairs',
        category: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
        caption: 'Intimate window seating overlooking the garden courtyard',
        category: 'seating'
      },
      {
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        caption: 'Aesthetic espresso bar and artisan pastry display',
        category: 'food'
      },
      {
        url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
        caption: 'Cozy quiet corners ideal for first date conversations',
        category: 'night'
      }
    ],
    ambianceOverview: {
      lighting: 'Warm & Dim Candlelight (Soft amber glow)',
      noiseLevel: 'Quiet & Relaxed (Great for easy conversation)',
      seatingStyle: 'Plush velvet couches & intimate corner tables',
      bestFor: 'First Dates, Relaxed Coffee & Afternoon Talk',
      music: 'Soft Acoustic, Lo-fi & French Bossa Nova',
      dressCode: 'Casual / Cute Coffee Date'
    },
    vibes: ['Cozy & Quiet', 'First Date Friendly', 'Aesthetic & Trendy'],
    priceLevels: [1, 2],
    tags: ['cafe', 'coffee', 'bakery', 'tea', 'dessert', 'romantic']
  },
  restaurant: {
    names: ['La Trattoria Amore', 'Le Petit Bistro & Wine', 'Cherry Blossom Japanese Dining', 'Cielo Italian Garden', 'Velvet & Oak Steakhouse', 'Solstice Mediterranean Kitchen', 'Bistrot de Paris', 'L\'Aura Fine Dining'],
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80'
    ],
    ambiancePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        caption: 'Romantic dining room with candlelit table arrangements and ambient wine racks',
        category: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
        caption: 'Intimate private dining booths with dim atmospheric lighting',
        category: 'seating'
      },
      {
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        caption: 'Handcrafted artisan pasta and curated wine pairings',
        category: 'food'
      },
      {
        url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
        caption: 'Evening romantic dinner ambiance with live soft piano',
        category: 'night'
      }
    ],
    ambianceOverview: {
      lighting: 'Candlelit & Dim (Intimate romantic atmosphere)',
      noiseLevel: 'Moderate & Elegant (Private feeling between tables)',
      seatingStyle: 'High-back booths, candlelit tables & white linen',
      bestFor: 'Anniversaries, Romantic Dinners & Special Moments',
      music: 'Live Piano, Smooth Jazz & Instrumental Classics',
      dressCode: 'Smart Casual / Dress to Impress'
    },
    vibes: ['Romantic & Dimly Lit', 'Special Occasion ($$$)', 'First Date Friendly'],
    priceLevels: [2, 3, 4],
    tags: ['restaurant', 'food', 'wine', 'dinner', 'candlelight']
  },
  rooftop: {
    names: ['Highline Sky Bar & Grill', 'Panorama Lounge & Cocktails', 'Cloud 9 Terrace & Dining', 'The Twilight View Lounge', 'Apex Rooftop Garden', 'Horizon Sunset Bar'],
    photos: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80'
    ],
    ambiancePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        caption: 'Panoramic open-air skyline terrace with 360-degree city sunset views',
        category: 'outdoor'
      },
      {
        url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
        caption: 'Illuminated cocktail bar and lounge seating under the stars',
        category: 'night'
      },
      {
        url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=800&q=80',
        caption: 'Comfortable daybeds and fire pit lounge areas for couples',
        category: 'seating'
      }
    ],
    ambianceOverview: {
      lighting: 'Fairy Lights, Fire Pits & Skyline Neon Glow',
      noiseLevel: 'Lively & Energetic (Vibrant evening lounge vibe)',
      seatingStyle: 'Outdoor lounge sofas, edge railings & high-top cocktail tables',
      bestFor: 'Golden Hour Sunset Drinks & Late Night Cocktails',
      music: 'Deep House, Tropical Beats & Lounge Chillout',
      dressCode: 'Upscale Casual / Cocktail Chic'
    },
    vibes: ['Scenic View', 'Lively & Fun', 'Special Occasion ($$$)'],
    priceLevels: [3, 4],
    tags: ['rooftop', 'bar', 'cocktails', 'scenic', 'sunset', 'lounge']
  },
  dessert: {
    names: ['Dolce Vita Gelateria & Creperie', 'Chocolatier & Sweet Lab', 'Honey & Butter Churros', 'Sweet Romance Patisserie', 'Matcha Heaven Cafe', 'The Waffle & Fondue Co.'],
    photos: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
    ],
    ambiancePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        caption: 'Charming dessert parlour with warm pastel decor and fondue station',
        category: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
        caption: 'Handcrafted seasonal pastries, crepes and specialty desserts',
        category: 'food'
      },
      {
        url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        caption: 'Shared chocolate fondue and gourmet ice cream flights',
        category: 'night'
      }
    ],
    ambianceOverview: {
      lighting: 'Warm Ambient Pastel & Neon Sign Accents',
      noiseLevel: 'Sweet & Cheerful (Relaxed and playful)',
      seatingStyle: 'Bistro round tables & marble dessert counters',
      bestFor: 'Post-Dinner Sweet Cravings & Casual First Dates',
      music: 'Indie Pop, Upbeat Acoustic & Chill Melodies',
      dressCode: 'Casual & Comfortable'
    },
    vibes: ['Budget-Friendly ($)', 'First Date Friendly', 'Cozy & Quiet'],
    priceLevels: [1, 2],
    tags: ['dessert', 'bakery', 'ice_cream', 'sweet', 'patisserie']
  },
  mall: {
    names: ['The Atrium Bistro & Promenade', 'Grand Mall Terrace Dining', 'The Glasshouse Eatery', 'Plaza Social Kitchen & Tap', 'SkyMall Gourmet Food Hall', 'Metropolis Casual Dining'],
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?auto=format&fit=crop&w=800&q=80'
    ],
    ambiancePhotos: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        caption: 'High-ceiling atrium restaurant with lush indoor plants and natural skylight',
        category: 'interior'
      },
      {
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
        caption: 'Terrace dining overlooking the fountain garden plaza',
        category: 'outdoor'
      }
    ],
    ambianceOverview: {
      lighting: 'Bright Natural Skylight / Warm Evening Accent Lighting',
      noiseLevel: 'Active & Lively (Fun social environment)',
      seatingStyle: 'Spacious booths, terrace seating & central tables',
      bestFor: 'Shopping Dates, Casual Lunch & Movie Date Dining',
      music: 'Contemporary Hits & Ambient Lounge',
      dressCode: 'Casual'
    },
    vibes: ['Lively & Fun', 'Budget-Friendly ($)', 'First Date Friendly'],
    priceLevels: [1, 2, 3],
    tags: ['mall', 'shopping_mall', 'restaurant', 'casual', 'bistro']
  }
};

const SAMPLE_REVIEWS = [
  {
    author: 'Elena Vance',
    rating: 5,
    text: 'Great cozy atmosphere, amazing coffee and perfect mood lighting for an intimate date night. The staff was super friendly!',
    time: 1718000000,
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    relativeTime: '2 weeks ago'
  },
  {
    author: 'Marcus Chen',
    rating: 5,
    text: 'Delicious handcrafted pasta and phenomenal wine pairings. A bit busy on weekends, so reserve in advance, but truly one of the best spots in town.',
    time: 1717000000,
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    relativeTime: '1 month ago'
  },
  {
    author: 'Sophia Martinez',
    rating: 4,
    text: 'Beautiful aesthetic, love the outdoor seating area. Drinks were slightly expensive, but the scenic vibe completely makes up for it.',
    time: 1716000000,
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    relativeTime: '2 months ago'
  },
  {
    author: 'Liam Johnson',
    rating: 5,
    text: 'Took my partner here for our anniversary. Outstanding service, quiet romantic music, and the molten chocolate lava cake was pure magic.',
    time: 1715000000,
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    relativeTime: '3 months ago'
  }
];

// Mall specific wings & sections for accurate mall-centric addresses
const MALL_SECTIONS = [
  'Mega Fashion Hall, Level 3',
  'Building B, Upper Ground Floor',
  'Mega Atrium, Level 2',
  'Building A, 2nd Floor Veranda',
  'The Bridgeway Sky Walk',
  'Mega Strip Open Promenade',
  'Rooftop Garden Terraces',
  'Ground Floor Fountain Courtyard'
];

function generateMockPlaces(centerLat, centerLng, radiusKm = 5, categoryType = null, keyword = '', cuisine = 'all', occasion = 'all') {
  const places = [];
  const categoriesToUse = categoryType && DATE_CATEGORIES[categoryType] 
    ? [categoryType] 
    : Object.keys(DATE_CATEGORIES);

  let idCounter = 1;
  categoriesToUse.forEach(catKey => {
    const cat = DATE_CATEGORIES[catKey];
    cat.names.forEach((name, index) => {
      // Deterministic offset clustered tightly (50m - 400m for tight hub precision)
      const angle = (idCounter * 53) % 360;
      const rad = (angle * Math.PI) / 180;
      
      // Tight distance offset (0.05 km to 0.4 km) for accurate venue focusing
      const maxDistance = Math.min(radiusKm * 0.4, 0.45);
      const distanceOffset = 0.04 + ((idCounter * 0.05) % maxDistance);
      
      // 1 degree lat ~ 111km, 1 degree lng ~ 111km * cos(lat)
      const latOffset = (distanceOffset / 111) * Math.cos(rad);
      const lngOffset = (distanceOffset / (111 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(rad);

      const lat = centerLat + latOffset;
      const lng = centerLng + lngOffset;
      const photo = cat.photos[index % cat.photos.length];
      const priceLevel = cat.priceLevels[index % cat.priceLevels.length];
      const rating = +(4.2 + ((idCounter * 0.11) % 0.7)).toFixed(1);
      const totalRatings = 60 + (idCounter * 75);

      const dLat = (lat - centerLat) * (Math.PI / 180);
      const dLon = (lng - centerLng) * (Math.PI / 180);
      const a = Math.sin(dLat/2)**2 + Math.cos(centerLat * Math.PI/180) * Math.cos(lat * Math.PI/180) * Math.sin(dLon/2)**2;
      const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      const section = MALL_SECTIONS[(idCounter - 1) % MALL_SECTIONS.length];

      // Assign realistic cuisine & occasion tags
      const cuisinesList = ['filipino', 'italian', 'japanese', 'korean', 'american', 'chinese', 'mediterranean', 'mexican', 'cafe_bakery'];
      const occasionsList = ['date_night', 'family_friendly', 'group_hangout', 'business_meeting', 'casual', 'special_occasion'];
      
      const assignedCuisine = cuisinesList[(idCounter - 1) % cuisinesList.length];
      const assignedOccasion = occasionsList[(idCounter - 1) % occasionsList.length];

      places.push({
        id: `mock_place_${idCounter}_${catKey}`,
        name: name,
        address: section,
        lat: lat,
        lng: lng,
        rating: rating,
        totalRatings: totalRatings,
        priceLevel: priceLevel,
        photoRef: null,
        photoUrl: photo,
        ambiancePhotos: cat.ambiancePhotos,
        ambianceOverview: cat.ambianceOverview,
        types: [...cat.tags, catKey, assignedCuisine, assignedOccasion],
        vibe: cat.vibes[index % cat.vibes.length],
        allVibes: cat.vibes,
        cuisine: assignedCuisine,
        occasion: assignedOccasion,
        openNow: idCounter % 6 !== 0,
        distance: +dist.toFixed(2),
        category: catKey
      });

      idCounter++;
    });
  });

  let filtered = places;

  // Filter keyword
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      p.types.some(t => t.toLowerCase().includes(kw)) ||
      p.vibe.toLowerCase().includes(kw)
    );
  }

  // Filter cuisine
  if (cuisine && cuisine !== 'all') {
    filtered = filtered.filter(p => p.cuisine === cuisine || p.types.includes(cuisine));
  }

  // Filter occasion
  if (occasion && occasion !== 'all') {
    filtered = filtered.filter(p => p.occasion === occasion || p.types.includes(occasion));
  }

  // Sort by distance
  return filtered.sort((a, b) => a.distance - b.distance);
}

function getMockPlaceDetails(placeId, fallbackLat = 14.5844, fallbackLng = 121.0568, placeName = null, placeAddress = null) {
  let categoryKey = 'restaurant';
  Object.keys(DATE_CATEGORIES).forEach(k => {
    if (placeId && placeId.includes(k)) categoryKey = k;
  });

  const cat = DATE_CATEGORIES[categoryKey] || DATE_CATEGORIES.restaurant;
  const photos = cat.photos;
  
  // Extract specific name from placeId if possible or match category
  let nameMatch = placeName || cat.names[0];
  if (!placeName && placeId) {
    const parts = placeId.split('_');
    const idx = parseInt(parts[2], 10);
    if (!isNaN(idx) && cat.names[idx % cat.names.length]) {
      nameMatch = cat.names[idx % cat.names.length];
    }
  }

  const address = placeAddress || 'Mega Fashion Hall, Level 3, SM Megamall';
  const directionsDestination = encodeURIComponent(`${nameMatch}, ${address}`);

  return {
    id: placeId,
    name: nameMatch,
    address: address,
    phone: '+63 (2) 8632-1234',
    website: 'https://example.com/date-spot',
    rating: 4.8,
    totalRatings: 380,
    priceLevel: cat.priceLevels[0] || 2,
    openingHours: [
      'Monday: 10:00 AM – 10:00 PM',
      'Tuesday: 10:00 AM – 10:00 PM',
      'Wednesday: 10:00 AM – 10:00 PM',
      'Thursday: 10:00 AM – 10:00 PM',
      'Friday: 10:00 AM – 11:00 PM',
      'Saturday: 10:00 AM – 11:00 PM',
      'Sunday: 10:00 AM – 10:00 PM'
    ],
    photos: photos,
    ambiancePhotos: cat.ambiancePhotos,
    ambianceOverview: cat.ambianceOverview,
    reviews: SAMPLE_REVIEWS,
    types: cat.tags,
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${directionsDestination}`,
    pros: [
      'great cozy atmosphere',
      'perfect mood lighting',
      'delicious handcrafted pasta',
      'friendly attentive staff',
      'convenient mall parking & access'
    ],
    cons: [
      'can get crowded during peak mall dinner hours',
      'slightly long waitlist on weekends'
    ],
    dateHighlights: [
      'Intimate acoustic playlists & warm amber lighting',
      'Complimentary candle setup for reservations',
      'Signature shared dessert & wine flight'
    ]
  };
}

module.exports = {
  DATE_CATEGORIES,
  SAMPLE_REVIEWS,
  generateMockPlaces,
  getMockPlaceDetails
};
