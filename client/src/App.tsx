import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Place } from './types/place';
import { fetchNearbyPlaces } from './services/api';
import { useDateStore } from './store/useDateStore';
import { useDebounce } from './hooks/useDebounce';
import { Navbar } from './components/layout/Navbar';
import { SearchAndFilterBar } from './components/search/SearchAndFilterBar';
import { DateMap } from './components/map/DateMap';
import { PlaceList } from './components/places/PlaceList';
import { PlaceDetailsModal } from './components/places/PlaceDetailsModal';
import { ItineraryModal } from './components/planner/ItineraryModal';
import { SurpriseDateModal } from './components/planner/SurpriseDateModal';
import { FavoritesDrawer } from './components/favorites/FavoritesDrawer';
import { VisitedJournalModal } from './components/journal/VisitedJournalModal';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';

export const App: React.FC = () => {
  const {
    selectedLocation,
    selectedCategory,
    selectedCuisine,
    selectedOccasion,
    selectedVibe,
    searchRadiusKm,
    minRating,
    selectedPriceLevels,
    onlyOpenNow,
    searchKeyword,
    selectedPlaceId,
    setSelectedPlaceId,
    activeViewMode,
    setActiveViewMode,
  } = useDateStore();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [cuisineDataLimited, setCuisineDataLimited] = useState(false);
  const [activeModalPlace, setActiveModalPlace] = useState<Place | null>(null);
  const [immediateFetchNonce, setImmediateFetchNonce] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [showInitialSplash, setShowInitialSplash] = useState(true);

  const searchParams = useMemo(
    () => ({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      radius: searchRadiusKm * 1000,
      category: selectedCategory,
      cuisine: selectedCuisine,
      occasion: selectedOccasion,
      minRating,
      priceLevels: selectedPriceLevels,
      onlyOpenNow,
      keyword: searchKeyword,
    }),
    [
      selectedLocation.lat,
      selectedLocation.lng,
      searchRadiusKm,
      selectedCategory,
      selectedCuisine,
      selectedOccasion,
      minRating,
      selectedPriceLevels,
      onlyOpenNow,
      searchKeyword,
    ]
  );

  const debouncedSearchParams = useDebounce(searchParams, 500);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(async (params: typeof searchParams, requestId: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const data = await fetchNearbyPlaces({
        ...params,
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current || controller.signal.aborted) return;

      setPlaces(data.results || []);
      setCuisineDataLimited(Boolean(data.cuisineDataLimited));
    } catch (err) {
      if (controller.signal.aborted) return;
      if (requestId !== requestIdRef.current) return;
      console.error('Error fetching places:', err);
      setPlaces([]);
      setCuisineDataLimited(false);
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced fetch on filter/search param changes
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    runFetch(debouncedSearchParams, requestId);
  }, [debouncedSearchParams, runFetch]);

  // Immediate fetch when user explicitly submits a new location
  useEffect(() => {
    if (immediateFetchNonce === 0) return;
    const requestId = ++requestIdRef.current;
    runFetch(searchParams, requestId);
  }, [immediateFetchNonce, searchParams, runFetch]);

  const loadPlaces = useCallback(() => {
    setImmediateFetchNonce(n => n + 1);
  }, []);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  const filteredPlaces = useMemo(() => places.filter((place) => {
    if (selectedVibe !== 'All Vibes') {
      const vibeLower = selectedVibe.toLowerCase();
      const matchVibe =
        place.vibe?.toLowerCase().includes(vibeLower) ||
        (selectedVibe === 'Budget-Friendly ($)' && place.priceLevel <= 1) ||
        (selectedVibe === 'Special Occasion ($$$)' && place.priceLevel >= 3);
      if (!matchVibe) return false;
    }

    if (minRating > 0 && (place.rating || 0) < minRating) {
      return false;
    }

    if (
      selectedPriceLevels.length > 0 &&
      !selectedPriceLevels.includes(place.priceLevel)
    ) {
      return false;
    }

    if (onlyOpenNow && !place.openNow) {
      return false;
    }

    return true;
  }), [places, selectedVibe, minRating, selectedPriceLevels, onlyOpenNow]);

  useEffect(() => {
    if (selectedPlaceId) {
      const found = places.find((p) => p.id === selectedPlaceId);
      if (found) {
        setActiveModalPlace(found);
      } else {
        setActiveModalPlace({
          id: selectedPlaceId,
          name: 'Spot Details',
          address: selectedLocation.name,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          rating: 4.8,
          totalRatings: 100,
          priceLevel: 2,
          types: ['restaurant'],
          openNow: true,
        });
      }
    } else {
      setActiveModalPlace(null);
    }
  }, [selectedPlaceId, places, selectedLocation]);

  const handleSelectPlace = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
  }, [setSelectedPlaceId]);

  const handlePreviewPlace = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
  }, [setSelectedPlaceId]);

  const handleCloseModal = () => {
    setSelectedPlaceId(null);
    setActiveModalPlace(null);
  };

  useEffect(() => {
    if (!showInitialSplash) return;

    const needsMapReady = activeViewMode !== 'list';
    if (loading || (needsMapReady && !mapReady)) return;

    const timer = window.setTimeout(() => {
      setShowInitialSplash(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [activeViewMode, loading, mapReady, showInitialSplash]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B2825] selection:bg-[#E7C8BB] selection:text-[#2B2825]">
      {showInitialSplash && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#FAF7F2]">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#C98F7E]/40 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border border-[#8C4A38]/20"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#8C4A38] text-[#FAF7F2] shadow-ambient-hover">
                <span className="text-2xl">✦</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xl font-bold tracking-[0.18em] uppercase text-[#8C4A38]">Faro</div>
              <p className="text-sm text-[#6E6258]">Finding warm places for your next date</p>
            </div>
            <div className="h-1 w-28 overflow-hidden rounded-full bg-[#E9DED2]">
              <div className="faro-splash-bar h-full w-full bg-[#8C4A38] rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <SearchAndFilterBar onSearchSubmit={loadPlaces} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeViewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <PlaceList
                places={filteredPlaces}
                isLoading={loading}
                cuisineDataLimited={cuisineDataLimited}
                onSelectPlace={handleSelectPlace}
                onRefresh={loadPlaces}
              />
            </div>

            <div className="hidden lg:block lg:col-span-5 sticky top-44 h-[calc(100vh-210px)]">
              <DateMap
                places={filteredPlaces}
                onSelectPlace={handlePreviewPlace}
                onMapReady={handleMapReady}
              />
            </div>
          </div>
        )}

        {activeViewMode === 'list' && (
          <div className="max-w-5xl mx-auto">
            <PlaceList
              places={filteredPlaces}
              isLoading={loading}
              cuisineDataLimited={cuisineDataLimited}
              onSelectPlace={handleSelectPlace}
              onRefresh={loadPlaces}
            />
          </div>
        )}

        {activeViewMode === 'map' && (
          <div className="w-full h-[calc(100vh-210px)]">
            <DateMap
              places={filteredPlaces}
              onSelectPlace={handlePreviewPlace}
              onMapReady={handleMapReady}
            />
          </div>
        )}
      </main>

      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setActiveViewMode(activeViewMode === 'map' ? 'list' : 'map')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#2B2825] text-white text-xs font-semibold tracking-editorial shadow-ambient-hover hover:bg-[#8C4A38] transition-colors"
        >
          {activeViewMode === 'map' ? (
            <>
              <ListIcon className="w-4 h-4" />
              <span>Show list</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4" />
              <span>Show map</span>
            </>
          )}
        </button>
      </div>

      <PlaceDetailsModal
        place={activeModalPlace}
        onClose={handleCloseModal}
      />

      <ItineraryModal />

      <SurpriseDateModal
        places={filteredPlaces}
        onSelectPlace={handleSelectPlace}
      />

      <FavoritesDrawer onSelectPlace={handleSelectPlace} />

      <VisitedJournalModal />
    </div>
  );
};
