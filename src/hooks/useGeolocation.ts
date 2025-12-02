import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: 'prompt' | 'granted' | 'denied' | null;
}

interface NearestRegion {
  id: string;
  name: string;
  country: string;
  description: string | null;
  distance: number;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: null,
  });

  const [nearestRegion, setNearestRegion] = useState<NearestRegion | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestRegion = useCallback(async (lat: number, lon: number) => {
    try {
      const { data: regions, error } = await supabase
        .from('regions')
        .select('id, name, country, description, latitude, longitude');

      if (error) throw error;

      if (regions && regions.length > 0) {
        let nearest: NearestRegion | null = null;
        let minDistance = Infinity;

        for (const region of regions) {
          if (region.latitude && region.longitude) {
            const distance = calculateDistance(
              lat,
              lon,
              Number(region.latitude),
              Number(region.longitude)
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearest = {
                id: region.id,
                name: region.name,
                country: region.country,
                description: region.description,
                distance: Math.round(distance),
              };
            }
          }
        }

        setNearestRegion(nearest);
      }
    } catch (err) {
      console.error('Error finding nearest region:', err);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          latitude,
          longitude,
          error: null,
          loading: false,
          permission: 'granted',
        });
        findNearestRegion(latitude, longitude);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access was denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }
        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permission: error.code === error.PERMISSION_DENIED ? 'denied' : null,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, [findNearestRegion]);

  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setState((prev) => ({ ...prev, permission: result.state as 'prompt' | 'granted' | 'denied' }));
        
        result.onchange = () => {
          setState((prev) => ({ ...prev, permission: result.state as 'prompt' | 'granted' | 'denied' }));
        };
      } catch {
        // Permissions API not fully supported
      }
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    ...state,
    nearestRegion,
    requestLocation,
  };
};
