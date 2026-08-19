import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Place, DateCategory } from '../../types/place';
import { useDateStore } from '../../store/useDateStore';
import { getDefaultImageForCategory } from '../../utils/vibeHelpers';
import { formatPrice, getPriceSymbols, formatDistance } from '../../utils/distance';
import {
  X,
  Sparkles,
  RotateCw,
  Star,
  Plus,
  Compass,
  Check,
  MapPin,
  Coffee,
  UtensilsCrossed,
  Wine,
  Cake,
  ExternalLink,
} from 'lucide-react';

interface SurpriseDateModalProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

export const SurpriseDateModal: React.FC<SurpriseDateModalProps> = ({
  places,
  onSelectPlace,
}) => {
  const {
    isSurpriseOpen,
    setIsSurpriseOpen,
    selectedLocation,
    itinerary,
    addToItinerary,
  } = useDateStore();

  const [categoryFilter, setCategoryFilter] = useState<DateCategory | 'all'>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(0); // 0 = Any
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5);
  const [spinning, setSpinning] = useState(false);
  const [resultPlace, setResultPlace] = useState<Place | null>(null);
  const [justAddedToPlan, setJustAddedToPlan] = useState(false);

  if (!isSurpriseOpen) return null;

  // Filter candidates based on modal filters and location proximity
  const getEligibleCandidates = () => {
    return places.filter((p) => {
      // Category filter
      if (categoryFilter !== 'all') {
        const cat = (p.category || p.types?.[0] || '').toLowerCase();
        if (!cat.includes(categoryFilter)) return false;
      }

      // Price filter
      if (maxPriceFilter > 0 && p.priceLevel > maxPriceFilter) {
        return false;
      }

      // Proximity distance filter
      if (p.distance && p.distance > maxDistanceKm) {
        return false;
      }

      return true;
    });
  };

  const handleSpin = () => {
    const candidates = getEligibleCandidates();
    const pool = candidates.length > 0 ? candidates : places;
    if (pool.length === 0) return;

    setSpinning(true);
    setJustAddedToPlan(false);

    let count = 0;
    const maxSpins = 14;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setResultPlace(pool[randomIdx]);
      count++;

      if (count >= maxSpins) {
        clearInterval(interval);
        setSpinning(false);

        // Celebratory confetti
        try {
          confetti({
            particleCount: 50,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#8C4A38', '#C08573', '#FAF7F2', '#EAE4DA'],
          });
        } catch {
          // Handled silently
        }
      }
    }, 110);
  };

  const inItinerary = resultPlace ? itinerary.some((s) => s.place.id === resultPlace.id) : false;

  const handleAddToPlan = () => {
    if (!resultPlace) return;
    addToItinerary(resultPlace);
    setJustAddedToPlan(true);
    setTimeout(() => setJustAddedToPlan(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-ambient-modal border border-[#EAE4DA] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#EAE4DA] text-[#2B2825] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4E5DE] border border-[#EAE4DA] flex items-center justify-center text-[#8C4A38] shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-editorial text-[#2B2825] leading-tight">
                Surprise Me
              </h3>
              <p className="text-[11px] text-[#6B6560] font-normal">
                Curated random spot near {selectedLocation.name.split(',')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSurpriseOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#F5EFE6] text-[#6B6560] hover:text-[#2B2825] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body with Filter Controls & Result */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Filters for Surprise Selection */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DA] space-y-3">
            <div className="text-[11px] font-semibold text-[#6B6560] uppercase tracking-caps flex items-center gap-1.5">
              <span>Filter Scope</span>
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All', icon: Sparkles },
                { id: 'cafe', label: 'Coffee', icon: Coffee },
                { id: 'restaurant', label: 'Dining', icon: UtensilsCrossed },
                { id: 'rooftop', label: 'Bars', icon: Wine },
                { id: 'dessert', label: 'Sweet', icon: Cake },
              ].map((item) => {
                const isSelected = categoryFilter === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategoryFilter(item.id as DateCategory | 'all')}
                    disabled={spinning}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-medium border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#7A3E2D] text-[#FAF7F2] border-[#7A3E2D] shadow-xs'
                        : 'bg-white text-[#3D3935] border-[#DDD5C8] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Price & Max Distance Scope */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#EAE4DA]">
              {/* Max Price */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-[#8A837C] mb-1">
                  Max Price
                </label>
                <select
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  disabled={spinning}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-[#DDD5C8] text-xs text-[#2B2825] bg-white focus:outline-none focus:border-[#8C4A38]"
                >
                  <option value={0}>Any Price</option>
                  <option value={1}>$ (Budget)</option>
                  <option value={2}>$$ (Moderate)</option>
                  <option value={3}>$$$ (Upscale)</option>
                  <option value={4}>$$$$ (Fine Dining)</option>
                </select>
              </div>

              {/* Distance Radius */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-[#8A837C] mb-1">
                  Max Distance
                </label>
                <select
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  disabled={spinning}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-[#DDD5C8] text-xs text-[#2B2825] bg-white focus:outline-none focus:border-[#8C4A38]"
                >
                  <option value={2}>Within 2 km (Walking/Mall)</option>
                  <option value={5}>Within 5 km (Neighborhood)</option>
                  <option value={10}>Within 10 km (City-wide)</option>
                  <option value={25}>Within 25 km (Greater Area)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Display Rolled Result Spot Card */}
          {resultPlace ? (
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                spinning
                  ? 'opacity-60 scale-95 border-[#EAE4DA] bg-white'
                  : 'opacity-100 scale-100 border-[#8C4A38] bg-white shadow-ambient ring-1 ring-[#8C4A38]/20'
              }`}
            >
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-[#FAF7F2]">
                <img
                  src={
                    resultPlace.photoUrl ||
                    getDefaultImageForCategory(resultPlace.category)
                  }
                  alt={resultPlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#7A3E2D] text-[10px] font-semibold tracking-editorial border border-[#EAE4DA]">
                  {resultPlace.vibe || 'Curated Spot'}
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-semibold text-[#2B2825] leading-snug line-clamp-2">
                    {resultPlace.name}
                  </h4>
                  <div className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-[#2B2825] bg-[#FDFBF7] px-2 py-0.5 rounded-full border border-[#EAE4DA]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{resultPlace.rating || '4.8'}</span>
                  </div>
                </div>

                <p className="text-xs text-[#6B6560] line-clamp-1 font-normal flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8C4A38] shrink-0" />
                  <span>{resultPlace.address}</span>
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#EAE4DA]/80 text-[#6B6560]">
                  <span>{formatDistance(resultPlace.distance)} away</span>
                  <span className="font-semibold text-[#2B2825]">
                    {getPriceSymbols(resultPlace.priceLevel)} {formatPrice(resultPlace.priceLevel).split(' ')[1]}
                  </span>
                </div>
              </div>

              {/* Actions on Result Spot */}
              {!spinning && (
                <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-[#EAE4DA]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSurpriseOpen(false);
                      onSelectPlace(resultPlace);
                    }}
                    className="flex-1 py-2 rounded-xl bg-[#2B2825] hover:bg-[#8C4A38] text-white text-xs font-semibold tracking-editorial transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToPlan}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-editorial transition-all flex items-center gap-1.5 shadow-xs ${
                      inItinerary || justAddedToPlan
                        ? 'bg-[#7A3E2D] text-[#FAF7F2]'
                        : 'bg-[#F4E5DE] text-[#7A3E2D] hover:bg-[#7A3E2D] hover:text-[#FAF7F2]'
                    }`}
                  >
                    {inItinerary || justAddedToPlan ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>In Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add to Visit</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 px-4 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#DDD5C8] text-center space-y-2">
              <Compass className="w-8 h-8 mx-auto text-[#8C4A38] stroke-[1.5]" />
              <p className="text-xs text-[#6B6560] font-normal max-w-xs mx-auto">
                Set your filters above and click the button below to pick a tailored spot near you.
              </p>
            </div>
          )}
        </div>

        {/* Dedicated Pinned Footer CTA Button (Always 100% Visible & Prominent) */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE4DA] shrink-0">
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning || places.length === 0}
            className="w-full py-3.5 rounded-2xl bg-[#7A3E2D] hover:bg-[#683324] text-[#FAF7F2] font-bold text-sm tracking-editorial shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>
              {spinning
                ? 'Curating Your Spot...'
                : resultPlace
                ? 'Roll Another Surprise Spot'
                : 'Surprise Me with a Spot'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
