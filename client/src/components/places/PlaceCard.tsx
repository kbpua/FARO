import React, { useState } from 'react';
import { Place } from '../../types/place';
import { useDateStore } from '../../store/useDateStore';
import { Star, Heart, Plus, Check } from 'lucide-react';
import { formatDistance, getPriceSymbols } from '../../utils/distance';
import { getDefaultImageForCategory, getVibeBadgeColor } from '../../utils/vibeHelpers';

interface PlaceCardProps {
  place: Place;
  onSelect: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onSelect }) => {
  const {
    favorites,
    addFavorite,
    removeFavorite,
    itinerary,
    addToItinerary,
    removeFromItinerary,
    selectedPlaceId,
  } = useDateStore();

  const [isHovered, setIsHovered] = useState(false);

  const [heartBouncing, setHeartBouncing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFav = favorites.some((f) => f.id === place.id);
  const inItinerary = itinerary.some((stop) => stop.place.id === place.id);
  const isSelected = selectedPlaceId === place.id;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartBouncing(true);
    setTimeout(() => setHeartBouncing(false), 250);

    if (isFav) {
      removeFavorite(place.id);
    } else {
      addFavorite(place);
    }
  };

  const handleItineraryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inItinerary) {
      const stop = itinerary.find((s) => s.place.id === place.id);
      if (stop) removeFromItinerary(stop.id);
    } else {
      addToItinerary(place);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  // Resolve photo source — guard against empty strings and null
  const rawPhoto = place.imageUrl || place.photoUrl;
  const hasValidPhoto = rawPhoto && rawPhoto.trim().length > 0;
  const photoSrc = hasValidPhoto
    ? rawPhoto!
    : getDefaultImageForCategory(place.category || place.types?.[0]);
  const isPlaceholderImage = !hasValidPhoto;

  // Clean tags
  const rawVibe = place.vibe
    ? place.vibe.replace('Friendly', '').replace('($)', '').replace('($$$)', '').trim()
    : 'Romantic';
  const vibeTags = [rawVibe];

  return (
    <div
      onClick={() => onSelect(place)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-[#753424] ring-2 ring-[#753424]/30 shadow-ambient-hover'
          : isHovered
          ? 'border-[#B8A894] shadow-ambient-hover -translate-y-0.5'
          : 'border-[#D5C9B8] shadow-ambient hover:border-[#B8A894] hover:shadow-ambient-hover hover:-translate-y-0.5'
      }`}
    >
      {/* Curated Photo with Seamless Corner Radius & Gradient Overlay */}
      <div className="relative aspect-[16/10] w-full rounded-t-2xl overflow-hidden bg-[#F5EFE6] shrink-0">
        {isPlaceholderImage ? (
          <div className="w-full h-full flex items-center justify-center bg-[#F5EFE6]">
            <img src={photoSrc} alt={place.name} className="w-24 h-24" />
          </div>
        ) : (
          <img
            src={photoSrc}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const fallback = getDefaultImageForCategory(place.category || place.types?.[0]);
              if (img.src !== fallback) img.src = fallback;
            }}
          />
        )}

        {/* Subtle dark gradient overlay at the bottom for badge contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none"></div>

        {/* Image source badge */}
        {place.imageSource && place.imageSource !== 'placeholder' && (
          <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded z-10">
            📷 {place.imageSource}
          </div>
        )}

        {/* Sage Green Open / Muted Warm Gray Closed Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-editorial shadow-xs ${
              place.openNow
                ? 'bg-[#5B7347] text-white'
                : 'bg-[#6E6761] text-white opacity-95'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                place.openNow ? 'bg-white' : 'bg-[#DDD5C8]'
              }`}
            ></span>
            <span>{place.openNow ? 'Open Now' : 'Closed'}</span>
          </span>
        </div>

        {/* Top Right Action Buttons: + Add to Visit & Heart Favorite */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* + Add to Visit Button */}
          <button
            type="button"
            onClick={handleItineraryClick}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xs flex items-center justify-center ${
              inItinerary || justAdded
                ? 'bg-[#5C2619] text-[#FAF7F2] ring-1 ring-[#5C2619]'
                : 'bg-white/90 hover:bg-white text-[#181614] hover:text-[#753424]'
            }`}
            title={inItinerary ? 'Remove from Visit Plan' : 'Add to Visit Plan (+)'}
          >
            {inItinerary || justAdded ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {/* Favorite Heart Icon */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full backdrop-blur-md bg-white/90 hover:bg-white transition-all duration-200 shadow-xs ${
              heartBouncing ? 'scale-115' : 'hover:scale-105 active:scale-95'
            }`}
            title={isFav ? 'Remove from saved' : 'Save to Favorites'}
          >
            <Heart
              className={`w-4 h-4 shrink-0 transition-colors ${
                isFav
                  ? 'fill-[#753424] stroke-[#753424]'
                  : 'stroke-[#231F1C] fill-transparent hover:stroke-[#753424]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Restaurant Name & Baseline Star Rating Badge: 2-line title wrapping in deep espresso */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#181614] group-hover:text-[#753424] transition-colors leading-snug line-clamp-2 break-words flex-1 min-h-[2.5rem]">
              {place.name}
            </h3>

            {/* Rating pill aligned with title in rich contrast */}
            <div className="inline-flex items-center gap-1 shrink-0 text-xs font-bold text-[#181614] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#D5C9B8] shadow-2xs mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span>{place.rating ? place.rating.toFixed(1) : '4.8'}</span>
            </div>
          </div>

          {/* Distinct Pastel Tags with High Contrast Text */}
          <div className="flex flex-wrap items-center gap-1.5">
            {vibeTags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-semibold tracking-editorial px-2.5 py-0.5 rounded-full border shadow-2xs ${getVibeBadgeColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Distance & Dark High-Contrast Price Metadata */}
        <div className="pt-2.5 border-t border-[#EAE4DA] flex items-end justify-between text-xs gap-2">
          <div className="flex flex-col min-w-0 gap-0.5">
            {place.address && (
              <span className="font-medium text-[#4D4640] truncate">
                {place.address.split(',')[0]}
              </span>
            )}
            {place.distance != null && (
              <span className="font-semibold text-[#753424]">
                {formatDistance(place.distance)}
              </span>
            )}
          </div>
          <span className="font-bold text-[#181614] tracking-editorial shrink-0">
            {getPriceSymbols(place.priceLevel)}
          </span>
        </div>
      </div>
    </div>
  );
};
