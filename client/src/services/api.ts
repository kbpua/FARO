import axios from 'axios';
import { Place, PlaceDetails, GeocodeResult, DateCategory, CuisineCategory, OccasionCategory } from '../types/place';

const api = axios.create({
  baseURL: '/api',
  timeout: 12000,
});

export interface PlacesSearchParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: DateCategory | 'all' | string;
  type?: DateCategory | string;
  cuisine?: CuisineCategory | string;
  occasion?: OccasionCategory | string;
  minRating?: number;
  priceLevels?: number[];
  onlyOpenNow?: boolean;
  keyword?: string;
  query?: string;
}

export async function fetchNearbyPlaces(params: PlacesSearchParams): Promise<{ results: Place[]; mode?: string }> {
  try {
    const res = await api.get('/places', {
      params: {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius || 5000,
        category: params.category === 'all' ? '' : params.category || params.type,
        cuisine: params.cuisine === 'all' ? '' : params.cuisine,
        occasion: params.occasion === 'all' ? '' : params.occasion,
        minRating: params.minRating || 0,
        priceLevels: params.priceLevels?.join(','),
        onlyOpenNow: params.onlyOpenNow ? 'true' : 'false',
        keyword: params.keyword || params.query || '',
      },
    });

    if (res.data && res.data.success) {
      return {
        results: res.data.results || [],
        mode: res.data.mode,
      };
    }
    return { results: [] };
  } catch (error) {
    console.error('Failed to fetch places:', error);
    throw error;
  }
}

export async function fetchPlaceDetails(
  placeId: string,
  lat?: number,
  lng?: number,
  placeName?: string,
  placeAddress?: string
): Promise<PlaceDetails | null> {
  try {
    const res = await api.get('/places/details', {
      params: {
        placeId,
        lat,
        lng,
        placeName,
        placeAddress,
      },
    });

    if (res.data && res.data.success) {
      return res.data.details;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch place details:', error);
    throw error;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const res = await api.get('/geocode', {
      params: { address },
    });

    if (res.data && res.data.success) {
      return {
        lat: res.data.lat,
        lng: res.data.lng,
        displayName: res.data.displayName,
        city: res.data.city,
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
