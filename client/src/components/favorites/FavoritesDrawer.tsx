import React from 'react';
import { useDateStore } from '../../store/useDateStore';
import { Place } from '../../types/place';
import {
  X,
  Heart,
  Trash2,
  Plus,
  Check,
  Star,
} from 'lucide-react';
import { getPriceSymbols } from '../../utils/distance';
import { getDefaultImageForCategory } from '../../utils/vibeHelpers';

export const FavoritesDrawer: React.FC<{
  onSelectPlace: (place: Place) => void;
}> = ({ onSelectPlace }) => {
  const {
    favorites,
    removeFavorite,
    itinerary,
    addToItinerary,
    isFavoritesOpen,
    setIsFavoritesOpen,
  } = useDateStore();

  if (!isFavoritesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-ambient-modal border border-cream-200 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-cream-50 border-b border-cream-200 text-charcoal-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white border border-cream-200 shadow-ambient text-terracotta-500">
              <Heart className="w-5 h-5 fill-terracotta-500 stroke-terracotta-500" />
            </div>
            <div>
              <h3 className="text-base font-medium tracking-editorial text-charcoal-900 leading-tight">
                Saved Locations
              </h3>
              <p className="text-xs text-charcoal-500 font-normal">
                {favorites.length} {favorites.length === 1 ? 'place' : 'places'} saved locally in browser
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFavoritesOpen(false)}
            className="p-1.5 rounded-full hover:bg-cream-100 text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-charcoal-500">
                <Heart className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-900 tracking-editorial">
                No saved locations yet
              </h4>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto font-normal">
                Tap the heart icon on any card to save it to your curated list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((place) => {
                const inItin = itinerary.some((s) => s.place.id === place.id);
                return (
                  <div
                    key={place.id}
                    className="p-3 rounded-2xl bg-cream-50 border border-cream-200 hover:border-cream-300 transition-all space-y-2 flex flex-col justify-between shadow-ambient"
                  >
                    <div className="flex gap-3">
                      <img
                        src={
                          place.photoUrl ||
                          getDefaultImageForCategory(place.category)
                        }
                        alt={place.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="overflow-hidden flex-1">
                        <h4
                          onClick={() => {
                            setIsFavoritesOpen(false);
                            onSelectPlace(place);
                          }}
                          className="font-medium text-xs text-charcoal-900 hover:text-terracotta-600 cursor-pointer truncate tracking-editorial"
                        >
                          {place.name}
                        </h4>
                        <p className="text-[11px] text-charcoal-500 truncate mt-0.5 font-normal">
                          {place.address}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-normal text-charcoal-700 mt-1">
                          <span className="flex items-center gap-0.5 font-medium text-charcoal-800">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {place.rating}
                          </span>
                          <span className="text-charcoal-400">•</span>
                          <span className="text-charcoal-600">{getPriceSymbols(place.priceLevel)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-cream-200 gap-1.5">
                      <button
                        onClick={() => {
                          if (!inItin) addToItinerary(place);
                        }}
                        disabled={inItin}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-medium tracking-editorial flex items-center justify-center gap-1 transition-colors ${
                          inItin
                            ? 'bg-cream-200 text-charcoal-600'
                            : 'bg-charcoal-900 text-white hover:bg-terracotta-600'
                        }`}
                      >
                        {inItin ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{inItin ? 'In Plan' : 'Add to Plan'}</span>
                      </button>

                      <button
                        onClick={() => removeFavorite(place.id)}
                        className="p-1.5 rounded-xl text-charcoal-400 hover:text-terracotta-600 hover:bg-cream-100 border border-cream-200"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
