import React from 'react';
import { useDateStore } from '../../store/useDateStore';
import {
  X,
  BookHeart,
  Calendar,
  Trash2,
} from 'lucide-react';

export const VisitedJournalModal: React.FC = () => {
  const {
    visitedRecords,
    removeVisitedRecord,
    isVisitedOpen,
    setIsVisitedOpen,
    setSelectedPlaceId,
  } = useDateStore();

  if (!isVisitedOpen) return null;

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
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-medium tracking-editorial text-charcoal-900 leading-tight">
                Date Memories & Notes
              </h3>
              <p className="text-xs text-charcoal-500 font-normal">
                {visitedRecords.length} {visitedRecords.length === 1 ? 'entry' : 'entries'} • Private in your browser
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisitedOpen(false)}
            className="p-1.5 rounded-full hover:bg-cream-100 text-charcoal-500 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {visitedRecords.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-charcoal-500">
                <BookHeart className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-900 tracking-editorial">
                No memories recorded yet
              </h4>
              <p className="text-xs text-charcoal-600 max-w-sm mx-auto font-normal">
                Open any place details and click "Add Date Note" to keep private notes of places you've visited.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visitedRecords.map((record) => (
                <div
                  key={record.placeId}
                  className="p-4 rounded-2xl bg-cream-50 border border-cream-200 shadow-ambient space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        onClick={() => {
                          setIsVisitedOpen(false);
                          setSelectedPlaceId(record.placeId);
                        }}
                        className="font-medium text-sm text-charcoal-900 hover:text-terracotta-600 cursor-pointer tracking-editorial"
                      >
                        {record.placeName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-0.5 font-normal">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-terracotta-500" />
                          {record.dateVisited}
                        </span>
                        <span>•</span>
                        <span className="flex items-center text-amber-500 font-medium">
                          {'★'.repeat(record.personalRating)}
                          <span className="text-charcoal-400 font-normal ml-1">({record.personalRating}/5)</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeVisitedRecord(record.placeId)}
                      className="p-1.5 rounded-xl text-charcoal-400 hover:text-terracotta-600 hover:bg-cream-100 border border-cream-200"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {record.notes && (
                    <div className="p-3 bg-white rounded-xl border border-cream-200 text-xs text-charcoal-700 italic font-normal">
                      "{record.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
