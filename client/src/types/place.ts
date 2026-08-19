export type DateCategory = 'cafe' | 'restaurant' | 'rooftop' | 'dessert' | 'mall' | 'scenic';

export type CuisineCategory =
  | 'all'
  | 'filipino'
  | 'italian'
  | 'japanese'
  | 'korean'
  | 'american'
  | 'chinese'
  | 'mediterranean'
  | 'mexican'
  | 'cafe_bakery';

export type OccasionCategory =
  | 'all'
  | 'date_night'
  | 'family_friendly'
  | 'group_hangout'
  | 'business_meeting'
  | 'casual'
  | 'special_occasion';

export type DateVibe = 
  | 'All Vibes'
  | 'First Date Friendly'
  | 'Cozy & Quiet'
  | 'Romantic & Dimly Lit'
  | 'Lively & Fun'
  | 'Scenic View'
  | 'Budget-Friendly ($)'
  | 'Special Occasion ($$$)';

export interface AmbiancePhoto {
  url: string;
  caption?: string;
  category?: 'interior' | 'outdoor' | 'night' | 'food' | 'seating';
}

export interface AmbianceOverview {
  lighting: string;
  noiseLevel: string;
  seatingStyle: string;
  bestFor: string;
  music: string;
  dressCode: string;
}

export type ImageSource = 'OSM' | 'Wikimedia' | 'Unsplash' | 'placeholder';
export type PlaceSource = 'OpenStreetMap' | 'Foursquare' | 'Google' | 'Mock';

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  totalRatings: number;
  priceLevel: number;
  photoRef?: string | null;
  photoUrl?: string | null;
  imageUrl?: string | null;
  imageSource?: ImageSource;
  source?: PlaceSource;
  types: string[];
  openNow: boolean;
  distance?: number;
  vibe?: string;
  category?: string;
  cuisine?: string;
  occasion?: string;
  ambiancePhotos?: AmbiancePhoto[];
  ambianceOverview?: AmbianceOverview;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  time?: number;
  profilePhoto?: string;
  relativeTime?: string;
}

export interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  rating: number;
  totalRatings: number;
  priceLevel: number;
  openingHours: string[];
  photos: string[];
  ambiancePhotos?: AmbiancePhoto[];
  ambianceOverview?: AmbianceOverview;
  reviews: Review[];
  types: string[];
  googleMapsUrl?: string;
  pros: string[];
  cons: string[];
  dateHighlights?: string[];
}

export interface ItineraryStop {
  id: string;
  place: Place;
  time: string;
  note: string;
  order: number;
}

export interface VisitedRecord {
  placeId: string;
  placeName: string;
  dateVisited: string;
  personalRating: number;
  notes: string;
  photoUrl?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
}

export interface FilterState {
  category: DateCategory | 'all';
  cuisine: CuisineCategory;
  occasion: OccasionCategory;
  vibe: DateVibe;
  radiusKm: number;
  minRating: number;
  priceLevels: number[];
  openOnly: boolean;
  searchKeyword: string;
}
