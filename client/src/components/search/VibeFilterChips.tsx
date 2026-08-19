import React from 'react';
import { Sparkles, Heart, Coffee, Moon, Flame, Mountain, DollarSign, Crown } from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';
import { DATE_VIBE_LIST } from '../../utils/vibeHelpers';
import { DateVibe } from '../../types/place';

const VIBE_ICONS: Record<DateVibe, React.ReactNode> = {
  'All Vibes': <Sparkles className="w-3.5 h-3.5" />,
  'First Date Friendly': <Heart className="w-3.5 h-3.5" />,
  'Cozy & Quiet': <Coffee className="w-3.5 h-3.5" />,
  'Romantic & Dimly Lit': <Moon className="w-3.5 h-3.5" />,
  'Lively & Fun': <Flame className="w-3.5 h-3.5" />,
  'Scenic View': <Mountain className="w-3.5 h-3.5" />,
  'Budget-Friendly ($)': <DollarSign className="w-3.5 h-3.5" />,
  'Special Occasion ($$$)': <Crown className="w-3.5 h-3.5" />,
};

export const VibeFilterChips: React.FC = () => {
  const { selectedVibe, setSelectedVibe } = useDateStore();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Choose Date Vibe
        </label>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DATE_VIBE_LIST.map((vibe) => {
          const isSelected = selectedVibe === vibe;
          return (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-glow ring-2 ring-rose-300 font-semibold scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-rose-500'}>
                {VIBE_ICONS[vibe]}
              </span>
              <span>{vibe}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
