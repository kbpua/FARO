import React from 'react';

export const PlaceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#EAE4DA] shadow-ambient flex flex-col animate-pulse">
      {/* Photo Placeholder */}
      <div className="relative aspect-[16/10] w-full rounded-t-2xl bg-[#EAE4DA]/60">
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-[#DDD5C8]/70" />
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#DDD5C8]/70" />
      </div>

      {/* Content Placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Title */}
            <div className="h-5 bg-[#EAE4DA] rounded-md w-3/4" />
            {/* Rating pill */}
            <div className="h-5 w-12 rounded-full bg-[#EAE4DA]" />
          </div>

          {/* Vibe / Cuisine Tags */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-4 w-20 rounded-full bg-[#F2EDE4]" />
            <div className="h-4 w-16 rounded-full bg-[#F2EDE4]" />
          </div>
        </div>

        {/* Footer Distance & Price */}
        <div className="pt-2.5 border-t border-[#EAE4DA]/70 flex items-center justify-between">
          <div className="h-3.5 w-14 rounded bg-[#EAE4DA]" />
          <div className="h-3.5 w-8 rounded bg-[#EAE4DA]" />
        </div>
      </div>
    </div>
  );
};
