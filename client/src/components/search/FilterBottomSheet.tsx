import React from 'react';
import { useDateStore } from '../../store/useDateStore';
import { DATE_VIBE_LIST } from '../../utils/vibeHelpers';
import { DateVibe, OccasionCategory } from '../../types/place';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Star,
  Clock,
  Sparkles,
  Heart,
  Coffee,
  Moon,
  Flame,
  Mountain,
  DollarSign,
  Crown,
  Users,
  Briefcase,
  Smile,
  Compass,
} from 'lucide-react';

const VIBE_ICONS: Record<DateVibe, React.ReactNode> = {
  'All Vibes': <Sparkles className="w-4 h-4" />,
  'First Date Friendly': <Heart className="w-4 h-4" />,
  'Cozy & Quiet': <Coffee className="w-4 h-4" />,
  'Romantic & Dimly Lit': <Moon className="w-4 h-4" />,
  'Lively & Fun': <Flame className="w-4 h-4" />,
  'Scenic View': <Mountain className="w-4 h-4" />,
  'Budget-Friendly ($)': <DollarSign className="w-4 h-4" />,
  'Special Occasion ($$$)': <Crown className="w-4 h-4" />,
};

const OCCASIONS_LIST: { id: OccasionCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'date_night', label: 'Date Night', icon: <Heart className="w-4 h-4" /> },
  { id: 'family_friendly', label: 'Family-Friendly', icon: <Smile className="w-4 h-4" /> },
  { id: 'group_hangout', label: 'Group Hangout', icon: <Users className="w-4 h-4" /> },
  { id: 'business_meeting', label: 'Business Meeting', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'casual', label: 'Casual Outing', icon: <Compass className="w-4 h-4" /> },
  { id: 'special_occasion', label: 'Special Occasion', icon: <Crown className="w-4 h-4" /> },
];

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const {
    selectedVibe,
    setSelectedVibe,
    selectedOccasion,
    setSelectedOccasion,
    searchRadiusKm,
    setSearchRadiusKm,
    minRating,
    setMinRating,
    selectedPriceLevels,
    togglePriceLevel,
    onlyOpenNow,
    setOnlyOpenNow,
    resetFilters,
  } = useDateStore();

  if (!isOpen) return null;

  const activeFilterCount =
    (selectedVibe !== 'All Vibes' ? 1 : 0) +
    (selectedOccasion !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedPriceLevels.length +
    (onlyOpenNow ? 1 : 0) +
    (searchRadiusKm !== 5 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-ambient-modal max-h-[88vh] sm:max-h-[85vh] flex flex-col z-10 border border-[#EAE4DA] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE4DA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8C4A38] shrink-0" />
            <h3 className="text-base font-semibold text-[#2B2825] tracking-editorial">Filter Options</h3>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#7A3E2D] text-[#FAF7F2] text-xs font-semibold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5EFE6] text-[#6B6560] hover:text-[#2B2825] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2B2825]">
          {/* Part 3: Occasion Filter Category */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-caps text-[#6B6560]">
              Occasion & Purpose
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {OCCASIONS_LIST.map((occ) => {
                const isSelected = selectedOccasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedOccasion(isSelected ? 'all' : occ.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left border ${
                      isSelected
                        ? 'border-[#7A3E2D] bg-[#7A3E2D] text-[#FAF7F2] font-semibold shadow-md ring-1 ring-[#7A3E2D]'
                        : 'border-[#D8D0C5] hover:border-[#8C4A38]/50 text-[#3D3935] bg-white hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <span className={`w-4 h-4 flex items-center justify-center shrink-0 ${isSelected ? 'text-[#FAF7F2]' : 'text-[#8C4A38]'}`}>
                      {occ.icon}
                    </span>
                    <span className="truncate">{occ.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vibe / Atmosphere Section */}
          <div className="space-y-3 pt-2 border-t border-[#EAE4DA]">
            <label className="block text-xs font-semibold uppercase tracking-caps text-[#6B6560]">
              Atmosphere & Vibe
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {DATE_VIBE_LIST.map((vibe) => {
                const isSelected = selectedVibe === vibe;
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => setSelectedVibe(vibe)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left border ${
                      isSelected
                        ? 'border-[#7A3E2D] bg-[#7A3E2D] text-[#FAF7F2] font-semibold shadow-md ring-1 ring-[#7A3E2D]'
                        : 'border-[#D8D0C5] hover:border-[#8C4A38]/50 text-[#3D3935] bg-white hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <span className={`w-4 h-4 flex items-center justify-center shrink-0 ${isSelected ? 'text-[#FAF7F2]' : 'text-[#8C4A38]'}`}>
                      {VIBE_ICONS[vibe]}
                    </span>
                    <span className="truncate">{vibe}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Radius */}
          <div className="space-y-3 pt-2 border-t border-[#EAE4DA]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-caps text-[#6B6560]">
                Distance Radius
              </label>
              <span className="text-xs font-semibold text-[#8C4A38]">{searchRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={searchRadiusKm}
              onChange={(e) => setSearchRadiusKm(parseInt(e.target.value, 10))}
              className="w-full accent-[#8C4A38] cursor-pointer h-1.5 bg-[#EAE4DA] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#8A837C]">
              <span>1 km</span>
              <span>10 km</span>
              <span>25 km</span>
            </div>
          </div>

          {/* Price Level */}
          <div className="space-y-3 pt-2 border-t border-[#EAE4DA]">
            <label className="block text-xs font-semibold uppercase tracking-caps text-[#6B6560]">
              Price Range
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((level) => {
                const isSelected = selectedPriceLevels.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => togglePriceLevel(level)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'border-[#7A3E2D] bg-[#7A3E2D] text-[#FAF7F2] shadow-md'
                        : 'border-[#D8D0C5] text-[#3D3935] bg-white hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {'$'.repeat(level)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3 pt-2 border-t border-[#EAE4DA]">
            <label className="block text-xs font-semibold uppercase tracking-caps text-[#6B6560]">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 4.0, 4.5].map((rating) => {
                const isSelected = minRating === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-[#7A3E2D] bg-[#7A3E2D] text-[#FAF7F2] shadow-md'
                        : 'border-[#D8D0C5] text-[#3D3935] bg-white hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {rating === 0 ? (
                      <span>Any</span>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{rating}+</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="pt-2 border-t border-[#EAE4DA]">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-xs text-[#2B2825] inline-flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-[#8A837C] shrink-0" />
                <span>Open now only</span>
              </span>
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="w-4 h-4 rounded text-[#8C4A38] focus:ring-[#8C4A38] border-[#D8D0C5] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE4DA] bg-[#FAF7F2] rounded-b-3xl flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-[#6B6560] hover:text-[#8C4A38] inline-flex items-center gap-1.5 py-2 px-3 tracking-editorial transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset filters</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#7A3E2D] hover:bg-[#683324] text-[#FAF7F2] text-xs font-semibold tracking-editorial transition-all shadow-sm"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
};
