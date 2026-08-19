import React, { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../../types/place';
import { useDateStore } from '../../store/useDateStore';
import { ClusteredMarkers } from './ClusteredMarkers';

const MapCenterUpdater: React.FC<{ lat: number; lng: number; radiusKm: number }> = ({ lat, lng, radiusKm }) => {
  const map = useMap();
  const prevCoords = useRef<{ lat: number; lng: number; radius: number } | null>(null);

  useEffect(() => {
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
  onMapReady?: () => void;
}> = ({ places, onSelectPlace, onMapReady }) => {
  const {
    selectedLocation,
    selectedPlaceId,
    searchRadiusKm,
  } = useDateStore();

  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  const center: [number, number] = [selectedLocation.lat, selectedLocation.lng];

  const handleHoverPlace = useCallback(
    (id: string | null) => setHoveredPlaceId(id),
    [setHoveredPlaceId]
  );

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-ambient border border-[#D5C9B8] bg-white">
      <MapContainer
        center={center}
        zoom={searchRadiusKm <= 2 ? 16 : 14}
        scrollWheelZoom={false}
        zoomControl={false}
        doubleClickZoom={true}
        className="w-full h-full z-10"
        whenReady={onMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          radiusKm={searchRadiusKm}
        />

        <ZoomControl position="topleft" />

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

        <Marker position={center} icon={userLocationIcon}>
          <Popup>
            <div className="p-2.5 text-center text-xs font-semibold text-[#181614]">
              <span className="text-[#753424] font-bold block mb-0.5 tracking-editorial">Search Origin</span>
              {selectedLocation.name}
            </div>
          </Popup>
        </Marker>

        <ClusteredMarkers
          places={places}
          selectedPlaceId={selectedPlaceId}
          hoveredPlaceId={hoveredPlaceId}
          onSelectPlace={onSelectPlace}
          onHoverPlace={handleHoverPlace}
        />
      </MapContainer>
    </div>
  );
};
