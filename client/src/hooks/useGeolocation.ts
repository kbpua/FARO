import { useState, useCallback } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  coordinates: { lat: number; lng: number } | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    coordinates: null,
  });

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser';
        setState({ loading: false, error: errorMsg, coordinates: null });
        reject(new Error(errorMsg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({ loading: false, error: null, coordinates: coords });
          resolve(coords);
        },
        (error) => {
          let errorMsg = 'Unable to retrieve your location';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied. Please allow location access or search an address.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'Location request timed out.';
          }
          setState({ loading: false, error: errorMsg, coordinates: null });
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { ...state, getCurrentLocation };
}
