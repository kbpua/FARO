import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Navigation,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  Sparkles,
  Coffee,
  UtensilsCrossed,
  Wine,
  Cake,
  Building2,
  ChevronRight,
  Utensils,
} from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geocodeAddress } from '../../services/api';
import { DateCategory, CuisineCategory } from '../../types/place';
import { FilterBottomSheet } from './FilterBottomSheet';
import { POPULAR_DATE_HUBS, RecommendedLocation, getMatchingRecommendations } from '../../utils/recommendedLocations';

const MINIMAL_CATEGORIES: { id: DateCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'cafe', label: 'Coffee', icon: Coffee },
  { id: 'restaurant', label: 'Dining', icon: UtensilsCrossed },
  { id: 'rooftop', label: 'Bars', icon: Wine },
  { id: 'dessert', label: 'Dessert', icon: Cake },
];

const CUISINE_LIST: { id: CuisineCategory; label: string }[] = [
  { id: 'all', label: 'All Cuisines' },
  { id: 'filipino', label: '🇵🇭 Filipino' },
  { id: 'italian', label: '🇮🇹 Italian' },
  { id: 'japanese', label: '🇯🇵 Japanese' },
  { id: 'korean', label: '🇰🇷 Korean' },
  { id: 'american', label: '🍔 American' },
  { id: 'chinese', label: '🥢 Chinese' },
  { id: 'mediterranean', label: '🫒 Mediterranean' },
  { id: 'mexican', label: '🌮 Mexican' },
  { id: 'cafe_bakery', label: '🥐 Café & Bakery' },
];

export const SearchAndFilterBar: React.FC<{
  onSearchSubmit: () => void;
}> = ({ onSearchSubmit }) => {
  const {
    selectedLocation,
    setSelectedLocation,
    setUserLocation,
    selectedCategory,
    setSelectedCategory,
    selectedCuisine,
    setSelectedCuisine,
    selectedOccasion,
    selectedVibe,
    minRating,
    selectedPriceLevels,
    onlyOpenNow,
    searchRadiusKm,
    setSearchRadiusKm,
    activeViewMode,
    setActiveViewMode,
  } = useDateStore();

  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getCurrentLocation, loading: isGpsLoading } = useGeolocation();

  // Active filter count
  const activeFiltersCount =
    (selectedVibe !== 'All Vibes' ? 1 : 0) +
    (selectedOccasion !== 'all' ? 1 : 0) +
    (selectedCuisine !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedPriceLevels.length +
    (onlyOpenNow ? 1 : 0) +
    (searchRadiusKm !== 5 ? 1 : 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseGps = async () => {
    try {
      const coords = await getCurrentLocation();
      setUserLocation(coords);
      setSelectedLocation({
        lat: coords.lat,
        lng: coords.lng,
        name: 'Near Current Location',
      });
      setIsDropdownOpen(false);
      onSearchSubmit();
    } catch {
      // Handled silently
    }
  };

  const handleSelectRecommendation = (rec: RecommendedLocation) => {
    setSelectedLocation({
      lat: rec.lat,
      lng: rec.lng,
      name: rec.name,
    });
    setSearchRadiusKm(2);
    setAddressInput('');
    setIsDropdownOpen(false);
    onSearchSubmit();
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    const directMatch = POPULAR_DATE_HUBS.find(
      (h) => h.name.toLowerCase() === addressInput.trim().toLowerCase()
    );
    if (directMatch) {
      handleSelectRecommendation(directMatch);
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(addressInput);
      if (result) {
        setSelectedLocation({
          lat: result.lat,
          lng: result.lng,
          name: result.displayName.split(',')[0],
        });
        setAddressInput('');
        setIsDropdownOpen(false);
        onSearchSubmit();
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  const toggleCategory = (catId: DateCategory) => {
    if (selectedCategory === catId) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catId);
    }
    setTimeout(() => onSearchSubmit(), 0);
  };

  const toggleCuisine = (cuisineId: CuisineCategory) => {
    if (selectedCuisine === cuisineId) {
      setSelectedCuisine('all');
    } else {
      setSelectedCuisine(cuisineId);
    }
    setTimeout(() => onSearchSubmit(), 0);
  };

  const matchedRecommendations = getMatchingRecommendations(addressInput);

  return (
    <div className="w-full bg-[#FAF7F2] border-b border-[#E0D7C9] py-3.5 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Top Search Input with Autocomplete Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1" ref={dropdownRef}>
            <form
              onSubmit={handleAddressSearch}
              className="w-full flex items-center bg-[#F5EFE6] hover:bg-white focus-within:bg-white focus-within:border-[#753424] focus-within:ring-2 focus-within:ring-[#753424]/20 border border-[#CCC1B0] rounded-full px-4 py-2 transition-all shadow-ambient"
            >
              <div className="w-4 h-4 flex items-center justify-center shrink-0 mr-3 text-[#753424]">
                <MapPin className="w-4 h-4 stroke-[2.2]" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={selectedLocation.name || 'Search city, area, or mall (e.g. SM Megamall, BGC)...'}
                className="w-full bg-transparent text-xs sm:text-sm text-[#181614] placeholder:text-[#7A7167] focus:outline-none font-medium selection:bg-[#E7C8BB] selection:text-[#181614]"
              />
              {addressInput.trim() ? (
                <button
                  type="submit"
                  disabled={isGeocoding}
                  className="w-7 h-7 rounded-full bg-[#753424] hover:bg-[#5C2619] text-[#FAF7F2] flex items-center justify-center shrink-0 ml-2 transition-colors shadow-xs"
                  title="Search location"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={isGpsLoading}
                  className="text-[#635B53] hover:text-[#753424] shrink-0 p-1 ml-1 transition-colors"
                  title="Use current location"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin text-[#753424]' : ''}`} />
                </button>
              )}
            </form>

            {/* Recommendations Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-ambient-modal border border-[#D5C9B8] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[380px] overflow-y-auto">
                <div className="p-3 bg-[#F5EFE6] border-b border-[#E0D7C9] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-caps text-[#4D4640] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#753424]" />
                    <span>{addressInput.trim() ? 'Matching Hubs & Locations' : 'Popular Spots & Malls'}</span>
                  </span>
                  <span className="text-[10px] text-[#635B53] font-medium">Direct focus on local spots</span>
                </div>

                <div className="p-1.5 divide-y divide-[#F5EFE6]">
                  {matchedRecommendations.map((hub) => (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => handleSelectRecommendation(hub)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[#F8F4ED] transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EDE4D6] group-hover:bg-[#F4E3DC] text-[#753424] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#181614] group-hover:text-[#753424] transition-colors leading-tight">
                            {hub.name}
                          </div>
                          <div className="text-[11px] text-[#4D4640] mt-0.5 line-clamp-1 font-medium">
                            {hub.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="hidden sm:inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EFE6] text-[#753424] border border-[#D5C9B8]">
                          {hub.tag}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#B5A997] group-hover:text-[#753424] transition-colors" />
                      </div>
                    </button>
                  ))}

                  {/* Custom Geocode option */}
                  {addressInput.trim() && (
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="w-full text-left p-3 rounded-xl hover:bg-[#F8F4ED] transition-all flex items-center gap-3 text-xs font-bold text-[#753424]"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#F4E3DC] text-[#753424] flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="flex-1 truncate">
                        <span>Search custom location: </span>
                        <strong className="underline">"{addressInput}"</strong>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Segmented Control for Split / List / Map */}
          <div className="hidden lg:flex items-center bg-[#E8DFD2] p-1 rounded-full border border-[#CCC1B0] shadow-2xs">
            <button
              onClick={() => setActiveViewMode('split')}
              className={`px-3.5 py-1.5 rounded-full text-xs tracking-editorial inline-flex items-center gap-1.5 transition-all duration-200 ${
                activeViewMode === 'split'
                  ? 'bg-white text-[#181614] font-bold shadow-xs'
                  : 'text-[#4D4640] hover:text-[#181614] font-semibold'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setActiveViewMode('list')}
              className={`px-3.5 py-1.5 rounded-full text-xs tracking-editorial inline-flex items-center gap-1.5 transition-all duration-200 ${
                activeViewMode === 'list'
                  ? 'bg-white text-[#181614] font-bold shadow-xs'
                  : 'text-[#4D4640] hover:text-[#181614] font-semibold'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5 shrink-0" />
              <span>List</span>
            </button>
            <button
              onClick={() => setActiveViewMode('map')}
              className={`px-3.5 py-1.5 rounded-full text-xs tracking-editorial inline-flex items-center gap-1.5 transition-all duration-200 ${
                activeViewMode === 'map'
                  ? 'bg-white text-[#181614] font-bold shadow-xs'
                  : 'text-[#4D4640] hover:text-[#181614] font-semibold'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Filter Action */}
        <div className="flex items-center justify-between gap-3">
          {/* Category Chips with rich deep mahogany active state */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {/* All Spots Pill */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setTimeout(() => onSearchSubmit(), 0);
              }}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs tracking-editorial transition-all whitespace-nowrap border ${
                selectedCategory === 'all'
                  ? 'bg-[#5C2619] text-[#FAF7F2] border-[#5C2619] font-bold shadow-md ring-1 ring-[#5C2619]'
                  : 'bg-white hover:bg-[#F2EAE0] text-[#231F1C] border-[#CCC1B0] font-medium shadow-xs'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${selectedCategory === 'all' ? 'text-[#FAF7F2]' : 'text-[#753424]'}`} />
              <span>All Spots</span>
            </button>

            {/* Category Pills */}
            {MINIMAL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs tracking-editorial transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-[#5C2619] text-[#FAF7F2] border-[#5C2619] font-bold shadow-md ring-1 ring-[#5C2619]'
                      : 'bg-white hover:bg-[#F2EAE0] text-[#231F1C] border-[#CCC1B0] font-medium shadow-xs'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#FAF7F2]' : 'text-[#635B53]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs tracking-editorial border transition-all shrink-0 shadow-xs ${
              activeFiltersCount > 0
                ? 'bg-[#F4E3DC] text-[#5C2619] border-[#753424] font-bold'
                : 'bg-white hover:bg-[#F2EAE0] text-[#231F1C] border-[#CCC1B0] font-semibold'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#753424] shrink-0 stroke-[2.2]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#5C2619] text-[#FAF7F2] text-[10px] flex items-center justify-center font-bold shrink-0">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Cuisine Filter Row with High Contrast */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[11px] font-bold text-[#4D4640] uppercase tracking-caps flex items-center gap-1 shrink-0 mr-1.5">
            <Utensils className="w-3 h-3 text-[#753424]" />
            <span>Cuisines:</span>
          </span>
          {CUISINE_LIST.map((c) => {
            const isActive = selectedCuisine === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCuisine(c.id)}
                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] tracking-editorial transition-all whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-[#5C2619] text-[#FAF7F2] border-[#5C2619] font-bold shadow-xs'
                    : 'bg-white hover:bg-[#F2EAE0] text-[#2B2520] border-[#CCC1B0] font-medium shadow-2xs'
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bottom Sheet / Modal with Occasions */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={onSearchSubmit}
      />
    </div>
  );
};
