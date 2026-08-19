import React from 'react';
import { Place } from '../../types/place';
import { PlaceCard } from './PlaceCard';
import { PlaceCardSkeleton } from './PlaceCardSkeleton';
import { EmptyPlacesState } from './EmptyPlacesState';
import { useDateStore } from '../../store/useDateStore';
import { Compass } from 'lucide-react';

interface PlaceListProps {
  places: Place[];
  isLoading: boolean;
  onSelectPlace: (place: Place) => void;
  onRefresh?: () => void;
}

export const PlaceList: React.FC<PlaceListProps> = ({ places, isLoading, onSelectPlace, onRefresh }) => {
  const { selectedLocation } = useDateStore();

  return (
    <div className="w-full space-y-6">
      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {/* Searching indicator */}
          <div className="p-3 bg-white rounded-2xl border border-[#EAE4DA] shadow-ambient flex items-center justify-center space-x-2 text-xs font-medium tracking-editorial text-[#6B6560]">
            <Compass className="w-4 h-4 text-[#8C4A38] animate-spin" />
            <span>Discovering curated spots near {selectedLocation.name.split(',')[0]}...</span>
          </div>

          {/* Skeleton Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <PlaceCardSkeleton key={n} />
            ))}
          </div>
        </div>
      )}

      {/* Friendly Empty State */}
      {!isLoading && places.length === 0 && (
        <EmptyPlacesState onReset={onRefresh || (() => {})} />
      )}

      {/* Result Cards Grid */}
      {!isLoading && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onSelect={onSelectPlace} />
          ))}
        </div>
      )}
    </div>
  );
};
