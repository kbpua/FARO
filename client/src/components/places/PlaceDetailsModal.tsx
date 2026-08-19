import React, { useEffect, useState } from 'react';
import { Place, PlaceDetails, VisitedRecord, AmbiancePhoto } from '../../types/place';
import { fetchPlaceDetails } from '../../services/api';
import { useDateStore } from '../../store/useDateStore';
import {
  X,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Plus,
  Check,
  ThumbsUp,
  AlertCircle,
  MessageSquareHeart,
  ExternalLink,
  Sparkles,
  BookHeart,
  Save,
  Trash2,
  Image as ImageIcon,
  Flame,
  Volume2,
  Armchair,
  Music,
  Shirt,
  Maximize2
} from 'lucide-react';
import { formatPrice, getPriceSymbols } from '../../utils/distance';
import { getDefaultImageForCategory } from '../../utils/vibeHelpers';

interface PlaceDetailsModalProps {
  place: Place | null;
  onClose: () => void;
}

type PhotoFilter = 'all' | 'interior' | 'outdoor' | 'night' | 'food' | 'seating';

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose }) => {
  const {
    favorites,
    addFavorite,
    removeFavorite,
    itinerary,
    addToItinerary,
    removeFromItinerary,
    addVisitedRecord,
    removeVisitedRecord,
    getVisitedRecord,
  } = useDateStore();

  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Visited note editing state
  const existingRecord = place ? getVisitedRecord(place.id) : undefined;
  const [isJournalEditing, setIsJournalEditing] = useState(false);
  const [personalRating, setPersonalRating] = useState(existingRecord?.personalRating || 5);
  const [dateVisited, setDateVisited] = useState(
    existingRecord?.dateVisited || new Date().toISOString().split('T')[0]
  );
  const [personalNotes, setPersonalNotes] = useState(existingRecord?.notes || '');
  const [journalSavedMsg, setJournalSavedMsg] = useState(false);

  useEffect(() => {
    if (!place) {
      setDetails(null);
      return;
    }

    let isMounted = true;

    fetchPlaceDetails(place.id, place.lat, place.lng, place.name, place.address)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
        }
      })
      .catch((err) => {
        console.error('Error loading details:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [place]);

  if (!place) return null;

  const isFav = favorites.some((f) => f.id === place.id);
  const inItinerary = itinerary.some((s) => s.place.id === place.id);

  // Build combined photos array
  const ambiancePhotos: AmbiancePhoto[] = details?.ambiancePhotos || place.ambiancePhotos || (
    details?.photos && details.photos.length > 0
      ? details.photos.map((url, i) => ({
          url,
          caption: `${place.name} ambiance photo ${i + 1}`,
          category: (i % 2 === 0 ? 'interior' : 'food') as any,
        }))
      : [
          {
            url: place.photoUrl || getDefaultImageForCategory(place.category),
            caption: `${place.name} overview`,
            category: 'interior'
          }
        ]
  );

  const filteredAmbiancePhotos = ambiancePhotos.filter((p) => {
    if (photoFilter === 'all') return true;
    return p.category === photoFilter;
  });

  const activeAmbiance = details?.ambianceOverview || place.ambianceOverview || {
    lighting: 'Warm & Candlelit (Romantic Dim Glow)',
    noiseLevel: 'Quiet & Intimate (Easy for Conversation)',
    seatingStyle: 'Cozy Booths, Corner Tables & Bar Stools',
    bestFor: 'First Dates, Intimate Dinners & Anniversaries',
    music: 'Soft Acoustic & Jazz Melodies',
    dressCode: 'Smart Casual'
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) return;

    const record: VisitedRecord = {
      placeId: place.id,
      placeName: place.name,
      dateVisited,
      personalRating,
      notes: personalNotes,
      photoUrl: ambiancePhotos[0]?.url || (place.photoUrl ? place.photoUrl : undefined),
    };

    addVisitedRecord(record);
    setJournalSavedMsg(true);
    setTimeout(() => {
      setJournalSavedMsg(false);
      setIsJournalEditing(false);
    }, 1500);
  };

  const handleDeleteJournal = () => {
    if (!place) return;
    removeVisitedRecord(place.id);
    setPersonalNotes('');
    setIsJournalEditing(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-ambient-modal border border-cream-200 my-8 max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-charcoal-900/60 hover:bg-charcoal-900 text-white backdrop-blur-md transition-all shadow-ambient"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto flex-1">
            {/* Main Hero Photo / Carousel */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-charcoal-900">
              <img
                src={ambiancePhotos[activePhotoIdx]?.url || ambiancePhotos[0]?.url}
                alt={place.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxPhoto(ambiancePhotos[activePhotoIdx]?.url || ambiancePhotos[0]?.url)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-black/20 to-black/30 pointer-events-none"></div>

              {/* Lightbox Zoom Icon Button */}
              <button
                onClick={() => setLightboxPhoto(ambiancePhotos[activePhotoIdx]?.url || ambiancePhotos[0]?.url)}
                className="absolute top-4 left-4 z-20 p-2 rounded-xl bg-charcoal-900/50 hover:bg-charcoal-900/70 text-white backdrop-blur-md text-xs font-normal tracking-editorial flex items-center gap-1.5 transition-all"
                title="View full-size photo"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zoom Photo</span>
              </button>

              {/* Photo Dots */}
              {ambiancePhotos.length > 1 && (
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-1.5 z-10">
                  {ambiancePhotos.slice(0, 6).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activePhotoIdx === idx ? 'w-5 bg-terracotta-400' : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Floating Title on Hero */}
              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-terracotta-500/90 text-white text-xs font-medium tracking-editorial shadow-xs">
                    {getPriceSymbols(place.priceLevel)} {formatPrice(place.priceLevel)}
                  </span>
                  {place.vibe && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-normal tracking-editorial">
                      {place.vibe}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium tracking-editorial leading-tight text-white">
                  {place.name}
                </h2>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-3 bg-cream-50/70 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (inItinerary) {
                      const s = itinerary.find((item) => item.place.id === place.id);
                      if (s) removeFromItinerary(s.id);
                    } else {
                      addToItinerary(place);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium tracking-editorial transition-all flex items-center gap-1.5 shadow-xs ${
                    inItinerary
                      ? 'bg-terracotta-500 text-white hover:bg-terracotta-600'
                      : 'bg-charcoal-900 text-white hover:bg-terracotta-600'
                  }`}
                >
                  {inItinerary ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>In Visit Plan</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Visit Plan</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (isFav) removeFavorite(place.id);
                    else addFavorite(place);
                  }}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs tracking-editorial font-normal ${
                    isFav
                      ? 'bg-terracotta-50 border-terracotta-300 text-terracotta-700'
                      : 'bg-white border-cream-200 text-charcoal-700 hover:bg-cream-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-terracotta-500 text-terracotta-500' : 'text-charcoal-500'}`} />
                  <span>{isFav ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <a
                href={
                  details?.googleMapsUrl ||
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${place.name}, ${place.address || ''}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-cream-200 text-charcoal-700 hover:text-terracotta-600 hover:border-terracotta-300 text-xs font-normal tracking-editorial transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
            </div>

            {/* Modal Body Details */}
            <div className="p-6 space-y-6">
              {/* Ambiance & Atmosphere Breakdown */}
              <div className="p-5 rounded-3xl bg-cream-50 border border-cream-200 shadow-ambient space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-charcoal-900 flex items-center gap-2 tracking-editorial">
                    <Sparkles className="w-4 h-4 text-terracotta-500" />
                    <span>Atmosphere & Ambiance</span>
                  </h3>
                  <span className="text-[11px] font-normal tracking-editorial px-2.5 py-0.5 rounded-full bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                    Vibe Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Lighting */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-terracotta-700 tracking-editorial">
                      <Flame className="w-3.5 h-3.5 text-terracotta-500" />
                      <span>Lighting</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.lighting}</p>
                  </div>

                  {/* Noise Level */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-sage-700 tracking-editorial">
                      <Volume2 className="w-3.5 h-3.5 text-sage-500" />
                      <span>Noise Level</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.noiseLevel}</p>
                  </div>

                  {/* Seating Style */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-800 tracking-editorial">
                      <Armchair className="w-3.5 h-3.5 text-charcoal-600" />
                      <span>Seating</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.seatingStyle}</p>
                  </div>

                  {/* Music */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-sage-700 tracking-editorial">
                      <Music className="w-3.5 h-3.5 text-sage-500" />
                      <span>Soundtrack</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.music}</p>
                  </div>

                  {/* Dress Code */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-terracotta-700 tracking-editorial">
                      <Shirt className="w-3.5 h-3.5 text-terracotta-500" />
                      <span>Attire</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.dressCode}</p>
                  </div>

                  {/* Best For */}
                  <div className="p-3 bg-white rounded-2xl border border-cream-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-terracotta-700 tracking-editorial">
                      <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500" />
                      <span>Best For</span>
                    </div>
                    <p className="text-xs text-charcoal-600 font-normal">{activeAmbiance.bestFor}</p>
                  </div>
                </div>
              </div>

              {/* Photo Gallery with Clean Filter Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-normal text-xs uppercase tracking-caps text-charcoal-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>Venue Photos ({ambiancePhotos.length})</span>
                  </h4>

                  {/* Gallery Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    {(['all', 'interior', 'outdoor', 'night', 'food', 'seating'] as PhotoFilter[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setPhotoFilter(f)}
                        className={`px-2.5 py-1 rounded-full capitalize tracking-editorial transition-all whitespace-nowrap border ${
                          photoFilter === f
                            ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200 font-medium'
                            : 'bg-white text-charcoal-600 border-cream-200 hover:bg-cream-100'
                        }`}
                      >
                        {f === 'all' ? 'All Photos' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredAmbiancePhotos.map((photo, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxPhoto(photo.url)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 cursor-pointer border border-cream-200 hover:border-terracotta-300 transition-all shadow-ambient"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                        <span className="text-[11px] font-normal line-clamp-2 leading-tight">
                          {photo.caption || 'Inspect photo'}
                        </span>
                      </div>
                      {photo.category && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-charcoal-900/60 backdrop-blur-xs text-white text-[9px] font-normal tracking-editorial capitalize">
                          {photo.category}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-cream-200 flex items-center space-x-3 shadow-ambient">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-medium">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-normal text-charcoal-500 uppercase tracking-caps">Google Rating</div>
                    <div className="text-xs font-medium text-charcoal-900">
                      {place.rating} ★ <span className="text-charcoal-400 font-normal">({place.totalRatings})</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-cream-200 flex items-center space-x-3 shadow-ambient">
                  <div className="w-9 h-9 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200/60 flex items-center justify-center font-medium">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-normal text-charcoal-500 uppercase tracking-caps">Vibe Profile</div>
                    <div className="text-xs font-medium text-charcoal-900 truncate">
                      {place.vibe || 'Cozy & Intimate'}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-cream-200 flex items-center space-x-3 shadow-ambient">
                  <div className="w-9 h-9 rounded-xl bg-sage-50 text-sage-700 border border-sage-200/60 flex items-center justify-center font-medium">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-normal text-charcoal-500 uppercase tracking-caps">Status</div>
                    <div className="text-xs font-medium text-charcoal-900">
                      {place.openNow ? 'Open Now' : 'Currently Closed'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Contact Info */}
              <div className="space-y-2.5 text-xs text-charcoal-700 bg-white p-4 rounded-2xl border border-cream-200 shadow-ambient">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
                  <span className="font-normal">{details?.address || place.address}</span>
                </div>
                {details?.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-terracotta-500 shrink-0" />
                    <a
                      href={`tel:${details.phone}`}
                      className="font-normal text-charcoal-900 hover:text-terracotta-600 transition-colors"
                    >
                      {details.phone}
                    </a>
                  </div>
                )}
                {details?.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-terracotta-500 shrink-0" />
                    <a
                      href={details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-normal text-charcoal-900 hover:text-terracotta-600 transition-colors truncate max-w-sm"
                    >
                      {details.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Extracted Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sage-50/50 border border-sage-200">
                  <h4 className="font-normal text-xs uppercase tracking-caps text-sage-700 flex items-center gap-1.5 mb-2.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-sage-600" />
                    <span>Highlights (From Guests)</span>
                  </h4>
                  {details?.pros && details.pros.length > 0 ? (
                    <ul className="space-y-1.5">
                      {details.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-charcoal-700 flex items-start gap-1.5">
                          <span className="text-sage-600">✓</span>
                          <span className="capitalize font-normal">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-charcoal-600 italic">
                      Known for charming atmosphere and thoughtful service.
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200">
                  <h4 className="font-normal text-xs uppercase tracking-caps text-charcoal-600 flex items-center gap-1.5 mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Good to Know</span>
                  </h4>
                  {details?.cons && details.cons.length > 0 ? (
                    <ul className="space-y-1.5">
                      {details.cons.map((con, i) => (
                        <li key={i} className="text-xs text-charcoal-700 flex items-start gap-1.5">
                          <span className="text-charcoal-400">•</span>
                          <span className="capitalize font-normal">{con}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-charcoal-600 italic">
                      Can get busy during peak evening hours.
                    </p>
                  )}
                </div>
              </div>

              {/* Opening Hours */}
              {details?.openingHours && details.openingHours.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-cream-200 shadow-ambient">
                  <h4 className="font-normal text-xs uppercase tracking-caps text-charcoal-500 flex items-center gap-1.5 mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>Schedule & Hours</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-charcoal-600">
                    {details.openingHours.map((schedule, idx) => (
                      <div key={idx} className="py-1 px-2.5 rounded-lg bg-cream-50 border border-cream-200/80">
                        {schedule}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Journal Log */}
              <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 shadow-ambient">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-charcoal-900 flex items-center gap-2 tracking-editorial">
                    <BookHeart className="w-4 h-4 text-terracotta-500" />
                    <span>Private Date Journal</span>
                  </h4>
                  {existingRecord && !isJournalEditing && (
                    <button
                      onClick={() => setIsJournalEditing(true)}
                      className="text-xs font-normal text-terracotta-600 hover:underline tracking-editorial"
                    >
                      Edit Note
                    </button>
                  )}
                </div>

                {!existingRecord && !isJournalEditing && (
                  <div className="text-center py-3">
                    <p className="text-xs text-charcoal-600 mb-2 font-normal">
                      Visited this spot? Save your private memories, favorite table, or thoughts.
                    </p>
                    <button
                      onClick={() => setIsJournalEditing(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-terracotta-500 text-white text-xs font-medium tracking-editorial hover:bg-terracotta-600 transition-colors shadow-xs"
                    >
                      + Add Date Note
                    </button>
                  </div>
                )}

                {existingRecord && !isJournalEditing && (
                  <div className="bg-white p-3.5 rounded-xl border border-cream-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-500">Date: <strong className="text-charcoal-800 font-medium">{existingRecord.dateVisited}</strong></span>
                      <div className="flex items-center text-amber-500">
                        {'★'.repeat(existingRecord.personalRating)}
                        <span className="text-charcoal-400 font-normal ml-1">({existingRecord.personalRating}/5)</span>
                      </div>
                    </div>
                    <p className="text-xs text-charcoal-700 italic bg-cream-50 p-2.5 rounded-lg border border-cream-200/80">
                      "{existingRecord.notes || 'Had a lovely date here.'}"
                    </p>
                  </div>
                )}

                {isJournalEditing && (
                  <form onSubmit={handleSaveJournal} className="space-y-3 bg-white p-4 rounded-xl border border-cream-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-normal uppercase tracking-caps text-charcoal-500 mb-1">
                          Date Visited:
                        </label>
                        <input
                          type="date"
                          value={dateVisited}
                          onChange={(e) => setDateVisited(e.target.value)}
                          className="w-full p-2 rounded-lg border border-cream-200 text-xs focus:ring-1 focus:ring-terracotta-400 focus:border-terracotta-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-normal uppercase tracking-caps text-charcoal-500 mb-1">
                          Personal Rating:
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setPersonalRating(star)}
                              className="p-1 text-lg transition-transform hover:scale-110"
                            >
                              <span className={star <= personalRating ? 'text-amber-400' : 'text-cream-300'}>
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-normal uppercase tracking-caps text-charcoal-500 mb-1">
                        Private Notes (Dishes, seating preference, atmosphere):
                      </label>
                      <textarea
                        value={personalNotes}
                        onChange={(e) => setPersonalNotes(e.target.value)}
                        placeholder="e.g. Quiet corner table by the window, great espresso..."
                        rows={2}
                        className="w-full p-2.5 rounded-lg border border-cream-200 text-xs focus:ring-1 focus:ring-terracotta-400 focus:border-terracotta-400"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {existingRecord && (
                        <button
                          type="button"
                          onClick={handleDeleteJournal}
                          className="text-xs text-terracotta-600 hover:text-terracotta-700 font-normal flex items-center gap-1 tracking-editorial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Note</span>
                        </button>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setIsJournalEditing(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-normal text-charcoal-600 hover:bg-cream-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-terracotta-500 text-white text-xs font-medium tracking-editorial hover:bg-terracotta-600 shadow-xs flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{journalSavedMsg ? 'Saved' : 'Save Note'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Public Reviews */}
              <div className="space-y-3">
                <h4 className="font-normal text-xs uppercase tracking-caps text-charcoal-500 flex items-center gap-1.5">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>Guest Reviews ({details?.reviews?.length || 0})</span>
                </h4>

                <div className="space-y-2.5">
                  {details?.reviews && details.reviews.length > 0 ? (
                    details.reviews.slice(0, 4).map((rev, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white border border-cream-200 space-y-1.5 shadow-ambient">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-cream-100 text-charcoal-700 font-medium flex items-center justify-center text-[10px] border border-cream-200">
                              {rev.author.charAt(0)}
                            </div>
                            <span className="font-medium text-charcoal-900">{rev.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 text-xs">{'★'.repeat(rev.rating)}</span>
                            <span className="text-[10px] text-charcoal-400">{rev.relativeTime}</span>
                          </div>
                        </div>
                        <p className="text-xs text-charcoal-600 leading-relaxed font-normal">{rev.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-charcoal-500 italic">No reviews available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-60 bg-charcoal-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[88vh] flex flex-col items-center">
            <img
              src={lightboxPhoto}
              alt="Ambiance view"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-ambient-modal border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/70 text-xs mt-3 text-center tracking-editorial font-normal">
              {place.name} — Atmosphere & Details
            </p>
          </div>
        </div>
      )}
    </>
  );
};
