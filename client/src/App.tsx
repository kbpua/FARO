import React, { useEffect, useState, useCallback } from 'react';
import { Place } from './types/place';
import { fetchNearbyPlaces } from './services/api';
import { useDateStore } from './store/useDateStore';
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
  const [activeModalPlace, setActiveModalPlace] = useState<Place | null>(null);

  // Fetch places from Faro API proxy
  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNearbyPlaces({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        radius: searchRadiusKm * 1000,
        category: selectedCategory,
        cuisine: selectedCuisine,
        occasion: selectedOccasion,
        minRating: minRating,
        priceLevels: selectedPriceLevels,
        onlyOpenNow: onlyOpenNow,
        keyword: searchKeyword,
      });

      setPlaces(data.results || []);
    } catch (err) {
      console.error('Error fetching places:', err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [
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
  ]);

  // Initial and reactive load on location/category/radius/cuisine/occasion change
  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  // Client-side vibe filter refinement if needed
  const filteredPlaces = places.filter((place) => {
    // Vibe filter
    if (selectedVibe !== 'All Vibes') {
      const vibeLower = selectedVibe.toLowerCase();
      const matchVibe =
        place.vibe?.toLowerCase().includes(vibeLower) ||
        (selectedVibe === 'Budget-Friendly ($)' && place.priceLevel <= 1) ||
        (selectedVibe === 'Special Occasion ($$$)' && place.priceLevel >= 3);
      if (!matchVibe) return false;
    }

    // Rating filter
    if (minRating > 0 && (place.rating || 0) < minRating) {
      return false;
    }

    // Price level filter
    if (
      selectedPriceLevels.length > 0 &&
      !selectedPriceLevels.includes(place.priceLevel)
    ) {
      return false;
    }

    // Open now filter
    if (onlyOpenNow && !place.openNow) {
      return false;
    }

    return true;
  });

  // Sync selectedPlaceId with activeModalPlace
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

  const handleSelectPlace = (place: Place) => {
    setSelectedPlaceId(place.id);
  };

  const handleCloseModal = () => {
    setSelectedPlaceId(null);
    setActiveModalPlace(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B2825] selection:bg-[#E7C8BB] selection:text-[#2B2825]">
      {/* Top Faro Navbar */}
      <Navbar />

      {/* Search & Category Filter Bar */}
      <SearchAndFilterBar onSearchSubmit={loadPlaces} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Split View (Desktop) */}
        {activeViewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Place List Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <PlaceList
                places={filteredPlaces}
                isLoading={loading}
                onSelectPlace={handleSelectPlace}
                onRefresh={loadPlaces}
              />
            </div>

            {/* Right: Sticky Leaflet Map (5 cols) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-44 h-[calc(100vh-210px)]">
              <DateMap
                places={filteredPlaces}
                onSelectPlace={handleSelectPlace}
              />
            </div>
          </div>
        )}

        {/* List Only View */}
        {activeViewMode === 'list' && (
          <div className="max-w-5xl mx-auto">
            <PlaceList
              places={filteredPlaces}
              isLoading={loading}
              onSelectPlace={handleSelectPlace}
              onRefresh={loadPlaces}
            />
          </div>
        )}

        {/* Map Only View */}
        {activeViewMode === 'map' && (
          <div className="w-full h-[calc(100vh-210px)]">
            <DateMap
              places={filteredPlaces}
              onSelectPlace={handleSelectPlace}
            />
          </div>
        )}
      </main>

      {/* Mobile Floating Map/List Switcher Pill */}
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

      {/* Modals & Drawers */}
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
