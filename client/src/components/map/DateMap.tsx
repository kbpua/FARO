import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../../types/place';
import { useDateStore } from '../../store/useDateStore';
import { Star, ExternalLink, Heart, Plus } from 'lucide-react';
import { formatDistance, getPriceSymbols } from '../../utils/distance';

// Stable MapCenterUpdater: only flyTo when actual coordinates change, avoiding hover/render jitter
const MapCenterUpdater: React.FC<{ lat: number; lng: number; radiusKm: number }> = ({ lat, lng, radiusKm }) => {
  const map = useMap();
  const prevCoords = useRef<{ lat: number; lng: number; radius: number } | null>(null);

  useEffect(() => {
    // Invalidate size on initial mount and when layout stabilizes to avoid gray tiles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const isFirstRun = prevCoords.current === null;
    const hasLocationChanged =
      !prevCoords.current ||
      Math.abs(prevCoords.current.lat - lat) > 0.0001 ||
      Math.abs(prevCoords.current.lng - lng) > 0.0001 ||
      prevCoords.current.radius !== radiusKm;

    if (hasLocationChanged) {
      prevCoords.current = { lat, lng, radius: radiusKm };
      const targetZoom = radiusKm <= 2 ? 16 : radiusKm <= 5 ? 15 : 13;

      if (isFirstRun) {
        map.setView([lat, lng], targetZoom, { animate: false });
      } else {
        map.flyTo([lat, lng], targetZoom, {
          duration: 0.8,
          easeLinearity: 0.25,
        });
      }
    }
  }, [lat, lng, radiusKm, map]);

  return null;
};

// Differentiate map pins by category with rich deep contrast colors
const getCategoryPinStyle = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('cafe') || cat.includes('coffee') || cat.includes('bakery')) {
    return { icon: '☕', bg: 'bg-[#7A3F20]', pointer: 'bg-[#7A3F20]' };
  }
  if (cat.includes('bar') || cat.includes('rooftop') || cat.includes('wine')) {
    return { icon: '🍸', bg: 'bg-[#7A2E44]', pointer: 'bg-[#7A2E44]' };
  }
  if (cat.includes('dessert') || cat.includes('ice_cream') || cat.includes('sweet')) {
    return { icon: '🧁', bg: 'bg-[#96473D]', pointer: 'bg-[#96473D]' };
  }
  // Default dining / restaurant
  return { icon: '🍽️', bg: 'bg-[#8C3A27]', pointer: 'bg-[#8C3A27]' };
};

// Create custom HTML icon for spots differentiated by category + price
const createDateMarkerIcon = (isSelected: boolean, isHovered: boolean, priceLevel: number, category?: string) => {
  const price = getPriceSymbols(priceLevel);
  const sizeClass = isSelected || isHovered ? 'scale-115 z-50' : 'scale-100';
  const style = getCategoryPinStyle(category);

  const bgClass = isSelected
    ? 'bg-[#181614] text-white border-2 border-white ring-2 ring-[#753424] shadow-md'
    : isHovered
    ? `${style.bg} text-white border-2 border-white shadow-md brightness-115`
    : `${style.bg} text-white border-2 border-white shadow-sm`;

  const pointerColor = isSelected ? 'bg-[#181614]' : style.pointer;

  const html = `
    <div class="transition-all duration-200 transform ${sizeClass} cursor-pointer flex flex-col items-center drop-shadow-sm">
      <div class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-editorial flex items-center gap-1 ${bgClass}">
        <span class="text-[10px] leading-none">${style.icon}</span>
        <span>${price}</span>
      </div>
      <div class="w-2 h-2 -mt-1 rotate-45 ${pointerColor} border-r border-b border-white"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-marker-icon',
    html: html,
    iconSize: [52, 30],
    iconAnchor: [26, 26],
    popupAnchor: [0, -26],
  });
};

// Custom icon for Center / User Location
const userLocationIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 bg-[#753424]/25 rounded-full animate-ping"></div>
      <div class="w-4 h-4 bg-[#753424] border-2 border-white rounded-full shadow-ambient flex items-center justify-center">
        <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const DateMap: React.FC<{
  places: Place[];
  onSelectPlace: (place: Place) => void;
}> = ({ places, onSelectPlace }) => {
  const {
    selectedLocation,
    selectedPlaceId,
    hoveredPlaceId,
    setHoveredPlaceId,
    searchRadiusKm,
    addFavorite,
    isFavorite,
    addToItinerary,
  } = useDateStore();

  const center: [number, number] = [selectedLocation.lat, selectedLocation.lng];

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-ambient border border-[#D5C9B8] bg-white">
      <MapContainer
        center={center}
        zoom={searchRadiusKm <= 2 ? 16 : 14}
        scrollWheelZoom={false}
        zoomControl={false}
        doubleClickZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Stable center and zoom updater */}
        <MapCenterUpdater
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          radiusKm={searchRadiusKm}
        />

        {/* Single clean top-left zoom controls */}
        <ZoomControl position="topleft" />

        {/* Search Radius Circle */}
        <Circle
          center={center}
          radius={searchRadiusKm * 1000}
          pathOptions={{
            color: '#753424',
            fillColor: '#753424',
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: '4, 8',
          }}
        />

        {/* User / Search Center Pin */}
        <Marker position={center} icon={userLocationIcon}>
          <Popup>
            <div className="p-2.5 text-center text-xs font-semibold text-[#181614]">
              <span className="text-[#753424] font-bold block mb-0.5 tracking-editorial">Search Origin</span>
              {selectedLocation.name}
            </div>
          </Popup>
        </Marker>

        {/* Date Spot Markers */}
        {places.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          const isHovered = hoveredPlaceId === place.id;
          const icon = createDateMarkerIcon(isSelected, isHovered, place.priceLevel, place.category || place.types?.[0]);

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={icon}
              eventHandlers={{
                mouseover: () => setHoveredPlaceId(place.id),
                mouseout: () => setHoveredPlaceId(null),
                click: () => onSelectPlace(place),
              }}
            >
              <Popup>
                <div className="w-64 overflow-hidden rounded-2xl bg-white text-[#181614] font-sans shadow-ambient-modal border border-[#D5C9B8]">
                  {/* Photo Banner */}
                  <div className="relative h-28 w-full bg-[#F5EFE6]">
                    <img
                      src={
                        place.photoUrl ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80'
                      }
                      alt={place.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addFavorite(place);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md shadow-xs transition-all ${
                          isFavorite(place.id)
                            ? 'bg-[#753424] text-white'
                            : 'bg-white/90 text-[#231F1C] hover:text-[#753424]'
                        }`}
                        title="Save to Favorites"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2.5">
                    <div>
                      {/* 2-line title wrapping in popup */}
                      <h4 className="font-bold text-sm text-[#181614] leading-snug line-clamp-2 break-words">
                        {place.name}
                      </h4>
                      <p className="text-[11px] text-[#4D4640] line-clamp-1 mt-0.5 font-medium">
                        {place.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EAE4DA]">
                      <div className="flex items-center space-x-1 font-bold text-[#181614]">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{place.rating ? place.rating.toFixed(1) : '4.8'}</span>
                        <span className="text-[10px] text-[#635B53] font-medium">({place.totalRatings})</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#4D4640]">
                        {formatDistance(place.distance)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => onSelectPlace(place)}
                        className="flex-1 py-1.5 rounded-xl bg-[#181614] hover:bg-[#753424] text-white text-xs font-bold tracking-editorial flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToItinerary(place);
                        }}
                        className="p-1.5 rounded-xl bg-[#F5EFE6] hover:bg-[#EAE1D3] text-[#231F1C] border border-[#D5C9B8] transition-colors"
                        title="Add to Itinerary"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
