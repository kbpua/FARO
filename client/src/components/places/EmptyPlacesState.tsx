import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';

export const EmptyPlacesState: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { resetFilters } = useDateStore();

  const handleReset = () => {
    resetFilters();
    onReset();
  };

  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#EAE4DA] shadow-ambient">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F3EC] border border-[#DDD5C8] flex items-center justify-center text-[#8C4A38] mb-4 shadow-xs">
        <Compass className="w-7 h-7 stroke-[1.75]" />
      </div>

      <h3 className="text-lg font-semibold text-[#2B2825] tracking-editorial">
        No spots found nearby
      </h3>

      <p className="text-xs sm:text-sm text-[#6B6560] max-w-sm mt-1.5 leading-relaxed font-normal">
        Try expanding your search radius, selecting different cuisine or category pills, or clearing active filters.
      </p>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7A3E2D] hover:bg-[#683324] text-[#FAF7F2] text-xs font-semibold tracking-editorial transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      </div>
    </div>
  );
};
