import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';
import { useDateStore } from '../../store/useDateStore';

const POPULAR_CITIES = [
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'Manila, Philippines', lat: 14.5995, lng: 120.9842 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
];

export const HeroSection: React.FC = () => {
  const { setSelectedLocation, selectedLocation } = useDateStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-rose-100/50 via-rose-50/30 to-slate-50 border-b border-rose-100/60 pt-6 pb-8 sm:pt-10 sm:pb-12">
      {/* Background ambient glow shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Anonymous Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-rose-200/80 text-rose-800 text-xs font-semibold shadow-sm backdrop-blur-sm mb-4">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span>100% Anonymous • No Account or Sign-in Required</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif-date text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Find the <span className="italic bg-gradient-to-r from-rose-600 via-coral-500 to-amber-600 bg-clip-text text-transparent">Perfect Date Spot</span> Near You
        </h1>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
          Discover romantic cafes, candlelit restaurants, vibrant rooftops, and cozy dessert bars tailored to your vibe.
        </p>

        {/* Quick City Presets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs font-medium text-slate-500 mr-1 flex items-center">
            <Compass className="w-3.5 h-3.5 mr-1 text-slate-400" /> Quick Explore:
          </span>
          {POPULAR_CITIES.map((city) => {
            const isSelected = selectedLocation.name.toLowerCase().includes(city.name.split(',')[0].toLowerCase());
            return (
              <button
                key={city.name}
                onClick={() => setSelectedLocation({ lat: city.lat, lng: city.lng, name: city.name })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                    : 'bg-white/80 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
