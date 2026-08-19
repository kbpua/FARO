import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Place } from '../../types/place';
import { formatDistance, getPriceSymbols } from '../../utils/distance';

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
  return { icon: '🍽️', bg: 'bg-[#8C3A27]', pointer: 'bg-[#8C3A27]' };
};

const createDateMarkerIcon = (
  isSelected: boolean,
  isHovered: boolean,
  priceLevel: number,
  category?: string
) => {
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
    <div style="pointer-events:none" class="transition-all duration-200 transform ${sizeClass} cursor-pointer flex flex-col items-center drop-shadow-sm">
      <div class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-editorial flex items-center gap-1 ${bgClass}">
        <span class="text-[10px] leading-none">${style.icon}</span>
        <span>${price}</span>
      </div>
      <div class="w-2 h-2 -mt-1 rotate-45 ${pointerColor} border-r border-b border-white"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-marker-icon',
    html,
    iconSize: [64, 44],
    iconAnchor: [32, 34],
    popupAnchor: [0, -26],
  });
};

const buildPopupHtml = (place: Place): string => {
  const photoUrl = place.imageUrl || place.photoUrl;
  const distanceStr = place.distance != null ? formatDistance(place.distance) : '';
  const photoSection = photoUrl && photoUrl.trim().length > 0
    ? `<div style="height:100px;overflow:hidden;border-radius:10px 10px 0 0;background:#F5EFE6;">
         <img src="${photoUrl}" alt="${place.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.display='none'" />
       </div>`
    : '';
  return `
    <div style="min-width:220px;max-width:260px;font-family:Inter,system-ui,sans-serif;background:#FDFAF6;border-radius:12px;overflow:hidden;">
      ${photoSection}
      <div style="padding:12px 14px 13px;">
        <div style="font-size:14px;font-weight:700;color:#181614;margin-bottom:3px;line-height:1.35;">${place.name}</div>
        ${place.address ? `<div style="font-size:11px;color:#6E6258;margin-bottom:6px;line-height:1.4;">${place.address.split(',')[0]}</div>` : ''}
        ${distanceStr ? `<div style="font-size:12px;color:#753424;font-weight:600;">${distanceStr}</div>` : ''}
      </div>
    </div>
  `;
};

interface ClusteredMarkersProps {
  places: Place[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPlace: (place: Place) => void;
  onHoverPlace: (id: string | null) => void;
}

export const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectPlace,
  onHoverPlace,
}) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const placesByIdRef = useRef<Map<string, Place>>(new Map());
  const selectedPlaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 17,
        chunkedLoading: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let bg = '#C47A5A';   // small  (< 10)
          let size = 36;
          if (count >= 50) { bg = '#5C2619'; size = 48; }       // large
          else if (count >= 10) { bg = '#8C3A27'; size = 42; }  // medium
          return L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;background:${bg};color:#FAF7F2;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size < 42 ? 12 : 13}px;font-weight:700;font-family:Inter,system-ui,sans-serif;border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 8px rgba(92,38,25,0.35);">${count}</div>`,
            className: 'faro-cluster-icon',
            iconSize: L.point(size, size),
          });
        },
      });
      map.addLayer(clusterGroupRef.current);
    }

    const clusterGroup = clusterGroupRef.current;
    const nextIds = new Set(places.map((place) => place.id));

    markersRef.current.forEach((marker, id) => {
      if (nextIds.has(id)) return;
      clusterGroup.removeLayer(marker);
      marker.off();
      markersRef.current.delete(id);
      placesByIdRef.current.delete(id);
    });

    places.forEach(place => {
      placesByIdRef.current.set(place.id, place);

      const isSelected = selectedPlaceRef.current === place.id;
      const isHovered = hoveredPlaceId === place.id;
      const icon = createDateMarkerIcon(
        isSelected,
        isHovered,
        place.priceLevel,
        place.category || place.types?.[0]
      );

      const existingMarker = markersRef.current.get(place.id);
      if (existingMarker) {
        existingMarker.setLatLng([place.lat, place.lng]);
        existingMarker.setIcon(icon);
        existingMarker.setPopupContent(buildPopupHtml(place));
        return;
      }

      const marker = L.marker([place.lat, place.lng], { icon });
      marker.bindPopup(buildPopupHtml(place), { maxWidth: 260 });
      marker.on('mouseover', () => onHoverPlace(place.id));
      marker.on('mouseout', () => onHoverPlace(null));
      marker.on('click', () => {
        selectedPlaceRef.current = place.id;
        marker.openPopup();
        onSelectPlace(place);
      });

      markersRef.current.set(place.id, marker);
      clusterGroup.addLayer(marker);
    });

    return () => {
      placesByIdRef.current.clear();
    };
  }, [places, map, onSelectPlace, onHoverPlace]);

  useEffect(() => {
    selectedPlaceRef.current = selectedPlaceId;
    markersRef.current.forEach((marker, id) => {
      const place = placesByIdRef.current.get(id);
      if (!place) return;
      const isSelected = selectedPlaceId === id;
      const isHovered = hoveredPlaceId === id;
      marker.setIcon(
        createDateMarkerIcon(
          isSelected,
          isHovered,
          place.priceLevel,
          place.category || place.types?.[0]
        )
      );

      if (selectedPlaceId === id && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    });
  }, [selectedPlaceId, hoveredPlaceId]);

  useEffect(() => {
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map]);

  return null;
};
