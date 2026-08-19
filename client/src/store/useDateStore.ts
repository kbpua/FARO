import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Place, ItineraryStop, VisitedRecord, DateVibe, DateCategory, CuisineCategory, OccasionCategory } from '../types/place';

interface FaroAppState {
  // Location
  userLocation: { lat: number; lng: number } | null;
  selectedLocation: { lat: number; lng: number; name: string };
  setSelectedLocation: (loc: { lat: number; lng: number; name: string }) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;

  // Filter State
  selectedCategory: DateCategory | 'all';
  selectedCuisine: CuisineCategory;
  selectedOccasion: OccasionCategory;
  selectedVibe: DateVibe;
  searchRadiusKm: number;
  minRating: number;
  selectedPriceLevels: number[];
  onlyOpenNow: boolean;
  searchKeyword: string;
  setSelectedCategory: (cat: DateCategory | 'all') => void;
  setSelectedCuisine: (cuisine: CuisineCategory) => void;
  setSelectedOccasion: (occasion: OccasionCategory) => void;
  setSelectedVibe: (vibe: DateVibe) => void;
  setSearchRadiusKm: (radius: number) => void;
  setMinRating: (rating: number) => void;
  togglePriceLevel: (level: number) => void;
  setOnlyOpenNow: (open: boolean) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;

  // Favorites / Bookmarks (Persisted in localStorage)
  favorites: Place[];
  addFavorite: (place: Place) => void;
  removeFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;

  // Itinerary / Visit Planner
  itinerary: ItineraryStop[];
  addToItinerary: (place: Place, time?: string, note?: string) => void;
  removeFromItinerary: (stopId: string) => void;
  updateItineraryStop: (stopId: string, updates: Partial<ItineraryStop>) => void;
  clearItinerary: () => void;
  reorderItinerary: (fromIndex: number, toIndex: number) => void;

  // Visited Journal & Notes
  visitedRecords: VisitedRecord[];
  addVisitedRecord: (record: VisitedRecord) => void;
  removeVisitedRecord: (placeId: string) => void;
  getVisitedRecord: (placeId: string) => VisitedRecord | undefined;

  // Active UI states
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  isItineraryOpen: boolean;
  setIsItineraryOpen: (open: boolean) => void;
  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;
  isSurpriseOpen: boolean;
  setIsSurpriseOpen: (open: boolean) => void;
  isVisitedOpen: boolean;
  setIsVisitedOpen: (open: boolean) => void;
  activeViewMode: 'split' | 'map' | 'list';
  setActiveViewMode: (mode: 'split' | 'map' | 'list') => void;
  hoveredPlaceId: string | null;
  setHoveredPlaceId: (id: string | null) => void;
}

export const useDateStore = create<FaroAppState>()(
  persist(
    (set, get) => ({
      // Default location: SM Megamall, Ortigas Center
      userLocation: null,
      selectedLocation: {
        lat: 14.5844,
        lng: 121.0568,
        name: 'SM Megamall, Mandaluyong',
      },
      setSelectedLocation: (loc) => set({ selectedLocation: loc }),
      setUserLocation: (loc) => set({ userLocation: loc }),

      // Filters
      selectedCategory: 'all',
      selectedCuisine: 'all',
      selectedOccasion: 'all',
      selectedVibe: 'All Vibes',
      searchRadiusKm: 5,
      minRating: 0,
      selectedPriceLevels: [],
      onlyOpenNow: false,
      searchKeyword: '',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSelectedCuisine: (cuisine) => set({ selectedCuisine: cuisine }),
      setSelectedOccasion: (occasion) => set({ selectedOccasion: occasion }),
      setSelectedVibe: (vibe) => set({ selectedVibe: vibe }),
      setSearchRadiusKm: (radius) => set({ searchRadiusKm: radius }),
      setMinRating: (rating) => set({ minRating: rating }),
      togglePriceLevel: (level) =>
        set((state) => ({
          selectedPriceLevels: state.selectedPriceLevels.includes(level)
            ? state.selectedPriceLevels.filter((p) => p !== level)
            : [...state.selectedPriceLevels, level],
        })),
      setOnlyOpenNow: (open) => set({ onlyOpenNow: open }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      resetFilters: () =>
        set({
          selectedCategory: 'all',
          selectedCuisine: 'all',
          selectedOccasion: 'all',
          selectedVibe: 'All Vibes',
          searchRadiusKm: 5,
          minRating: 0,
          selectedPriceLevels: [],
          onlyOpenNow: false,
          searchKeyword: '',
        }),

      // Favorites (Persisted in localStorage)
      favorites: [],
      addFavorite: (place) =>
        set((state) => {
          if (state.favorites.some((f) => f.id === place.id)) return state;
          return { favorites: [place, ...state.favorites] };
        }),
      removeFavorite: (placeId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== placeId),
        })),
      isFavorite: (placeId) => get().favorites.some((f) => f.id === placeId),

      // Itinerary Builder (Persisted in localStorage)
      itinerary: [],
      addToItinerary: (place, time = '07:00 PM', note = '') =>
        set((state) => {
          const newStop: ItineraryStop = {
            id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            place,
            time,
            note,
            order: state.itinerary.length + 1,
          };
          return { itinerary: [...state.itinerary, newStop] };
        }),
      removeFromItinerary: (stopId) =>
        set((state) => ({
          itinerary: state.itinerary
            .filter((stop) => stop.id !== stopId)
            .map((stop, idx) => ({ ...stop, order: idx + 1 })),
        })),
      updateItineraryStop: (stopId, updates) =>
        set((state) => ({
          itinerary: state.itinerary.map((stop) =>
            stop.id === stopId ? { ...stop, ...updates } : stop
          ),
        })),
      clearItinerary: () => set({ itinerary: [] }),
      reorderItinerary: (fromIndex, toIndex) =>
        set((state) => {
          const items = [...state.itinerary];
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return {
            itinerary: items.map((stop, idx) => ({ ...stop, order: idx + 1 })),
          };
        }),

      // Visited Journal
      visitedRecords: [],
      addVisitedRecord: (record) =>
        set((state) => {
          const filtered = state.visitedRecords.filter((r) => r.placeId !== record.placeId);
          return { visitedRecords: [record, ...filtered] };
        }),
      removeVisitedRecord: (placeId) =>
        set((state) => ({
          visitedRecords: state.visitedRecords.filter((r) => r.placeId !== placeId),
        })),
      getVisitedRecord: (placeId) =>
        get().visitedRecords.find((r) => r.placeId === placeId),

      // UI
      selectedPlaceId: null,
      setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),
      isItineraryOpen: false,
      setIsItineraryOpen: (open) => set({ isItineraryOpen: open }),
      isFavoritesOpen: false,
      setIsFavoritesOpen: (open) => set({ isFavoritesOpen: open }),
      isSurpriseOpen: false,
      setIsSurpriseOpen: (open) => set({ isSurpriseOpen: open }),
      isVisitedOpen: false,
      setIsVisitedOpen: (open) => set({ isVisitedOpen: open }),
      activeViewMode: 'split',
      setActiveViewMode: (mode) => set({ activeViewMode: mode }),
      hoveredPlaceId: null,
      setHoveredPlaceId: (id) => set({ hoveredPlaceId: id }),
    }),
    {
      name: 'faro_lifestyle_storage_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        itinerary: state.itinerary,
        visitedRecords: state.visitedRecords,
        selectedLocation: state.selectedLocation,
        searchRadiusKm: state.searchRadiusKm,
      }),
    }
  )
);
