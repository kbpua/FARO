import React from 'react';
import { Heart, CalendarDays, Sparkles, Compass } from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';

export const Navbar: React.FC = () => {
  const {
    favorites,
    itinerary,
    setIsFavoritesOpen,
    setIsItineraryOpen,
    setIsSurpriseOpen,
  } = useDateStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D5C9B8] h-16 flex items-center shadow-xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Faro Boutique Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 rounded-full bg-[#F4E3DC] flex items-center justify-center border border-[#D5C9B8] text-[#753424] transition-transform group-hover:scale-105 shadow-2xs">
            <Compass className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="font-bold text-[19px] tracking-editorial text-[#181614]">
            Faro
          </span>
        </div>

        {/* Minimalist Navigation Actions with Stronger Contrast */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Surprise Spot */}
          <button
            onClick={() => setIsSurpriseOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold tracking-editorial text-[#2B2520] hover:text-[#181614] hover:bg-[#F2EAE0] transition-colors"
            title="Curate a random spot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#753424] shrink-0" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>

          {/* Plan a Visit */}
          <button
            onClick={() => setIsItineraryOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold tracking-editorial text-[#2B2520] hover:text-[#181614] hover:bg-[#F2EAE0] transition-colors"
            title="Plan a Visit"
          >
            <CalendarDays className="w-4 h-4 text-[#753424] shrink-0" />
            <span className="hidden sm:inline">Plan a Visit</span>
            {itinerary.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#5C2619] text-[#FAF7F2] text-[10px] flex items-center justify-center font-bold shrink-0">
                {itinerary.length}
              </span>
            )}
          </button>

          {/* Saved Favorites */}
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="relative p-2.5 rounded-full text-[#2B2520] hover:text-[#181614] hover:bg-[#F2EAE0] transition-colors"
            title="Saved Spots"
          >
            <Heart className="w-4 h-4 stroke-[#2B2520] hover:stroke-[#753424] transition-colors" />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#753424]"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
