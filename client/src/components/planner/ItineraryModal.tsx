import React, { useState } from 'react';
import { useDateStore } from '../../store/useDateStore';
import {
  X,
  CalendarDays,
  Clock,
  Trash2,
  Share2,
  Check,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

export const ItineraryModal: React.FC = () => {
  const {
    itinerary,
    removeFromItinerary,
    updateItineraryStop,
    clearItinerary,
    reorderItinerary,
    isItineraryOpen,
    setIsItineraryOpen,
    setSelectedPlaceId,
  } = useDateStore();

  const [copied, setCopied] = useState(false);

  if (!isItineraryOpen) return null;

  const handleShare = () => {
    if (itinerary.length === 0) return;

    let text = `VISIT ITINERARY\n\n`;
    itinerary.forEach((stop, idx) => {
      text += `Stop ${idx + 1}: ${stop.place.name} (${stop.time})\n`;
      text += `Address: ${stop.place.address}\n`;
      if (stop.note) text += `Note: "${stop.note}"\n`;
      text += `Directions: https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        stop.place.name + ', ' + stop.place.address
      )}\n\n`;
    });
    text += `Curated with Faro`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-ambient-modal border border-[#EAE4DA] my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F2] border-b border-[#EAE4DA] text-[#2B2825] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white border border-[#EAE4DA] shadow-ambient text-[#8C4A38]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-editorial text-[#2B2825] leading-tight">
                Plan a Visit
              </h3>
              <p className="text-xs font-normal text-[#6B6560]">
                {itinerary.length} {itinerary.length === 1 ? 'stop' : 'stops'} planned • Saved in local storage
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsItineraryOpen(false)}
            className="p-1.5 rounded-full hover:bg-[#F5EFE6] text-[#6B6560] hover:text-[#2B2825] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {itinerary.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE4DA] flex items-center justify-center mx-auto text-[#8C4A38]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#2B2825]">No stops planned yet</h4>
              <p className="text-xs text-[#6B6560] max-w-xs mx-auto">
                Explore spots and click the <strong className="text-[#2B2825]">"+"</strong> button on cards to build your custom itinerary.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {itinerary.map((stop, index) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-2xl bg-white border border-[#EAE4DA] hover:border-[#DDD5C8] transition-all shadow-ambient flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#EAE4DA] text-[#8C4A38] text-xs font-semibold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => {
                            setSelectedPlaceId(stop.place.id);
                            setIsItineraryOpen(false);
                          }}
                          className="font-semibold text-sm text-[#2B2825] hover:text-[#8C4A38] cursor-pointer truncate transition-colors"
                        >
                          {stop.place.name}
                        </h4>
                        <span className="text-[11px] text-[#8C4A38] font-semibold shrink-0">
                          {stop.place.rating} ★
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6560] truncate">{stop.place.address}</p>
                    </div>
                  </div>

                  {/* Controls & Time Input */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE4DA]">
                    {/* Time Input */}
                    <div className="flex items-center bg-[#FAF7F2] border border-[#EAE4DA] rounded-lg px-2 py-1 text-xs text-[#2B2825]">
                      <Clock className="w-3.5 h-3.5 text-[#8C4A38] mr-1.5 shrink-0" />
                      <input
                        type="text"
                        value={stop.time}
                        onChange={(e) => updateItineraryStop(stop.id, { time: e.target.value })}
                        className="bg-transparent text-xs w-16 focus:outline-none font-medium"
                        placeholder="Time"
                      />
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => reorderItinerary(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 text-[#6B6560] hover:text-[#2B2825] disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderItinerary(index, index + 1)}
                        disabled={index === itinerary.length - 1}
                        className="p-1 text-[#6B6560] hover:text-[#2B2825] disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromItinerary(stop.id)}
                      className="p-1 text-[#8A837C] hover:text-[#8C4A38] transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {itinerary.length > 0 && (
          <div className="p-4 bg-[#FAF7F2] border-t border-[#EAE4DA] flex items-center justify-between gap-3">
            <button
              onClick={clearItinerary}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-editorial text-[#6B6560] hover:text-[#8C4A38] transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-xl bg-[#7A3E2D] hover:bg-[#683324] text-[#FAF7F2] text-xs font-semibold tracking-editorial shadow-ambient transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Itinerary</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
