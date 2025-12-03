import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Key } from 'lucide-react';

interface UserLocation {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
}

interface UserMapProps {
  className?: string;
}

export const UserMap = ({ className }: UserMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, current_latitude, current_longitude')
        .not('current_latitude', 'is', null)
        .not('current_longitude', 'is', null);
      
      if (!error && data) {
        setUsers(data);
      }
    };
    
    fetchUsers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('profiles-location')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // Apple Maps inspired style - light, clean, minimal
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 1.5,
        pitch: 0,
        attributionControl: false,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapError(null);
        
        // Add user markers
        users.forEach((user) => {
          if (user.current_latitude && user.current_longitude) {
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.innerHTML = `
              <div class="w-8 h-8 rounded-full bg-primary/90 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:scale-110 transition-transform">
                ${user.display_name?.[0]?.toUpperCase() || '?'}
              </div>
            `;

            new mapboxgl.Marker(el)
              .setLngLat([user.current_longitude, user.current_latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false })
                  .setHTML(`
                    <div class="p-2 text-center">
                      <p class="font-semibold text-sm">${user.display_name || 'Anonymous'}</p>
                    </div>
                  `)
              )
              .addTo(map.current!);
          }
        });
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Invalid token or map error. Please check your Mapbox public token.');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map. Please check your Mapbox token.');
    }

    return () => {
      map.current?.remove();
    };
  }, [tokenSubmitted, mapboxToken, users]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setTokenSubmitted(true);
      setMapError(null);
    }
  };

  if (!tokenSubmitted) {
    return (
      <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">User Map</h3>
            <p className="text-sm text-muted-foreground">See listeners around the world</p>
          </div>
        </div>
        
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              Enter your Mapbox Public Token
            </label>
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Get your free token at{' '}
              <a 
                href="https://mapbox.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <Button type="submit" className="w-full gap-2">
            <Users className="w-4 h-4" />
            Show User Map
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border overflow-hidden ${className}`}>
      <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Listeners Worldwide</span>
        </div>
        <span className="text-xs text-muted-foreground">{users.length} active</span>
      </div>
      
      {mapError ? (
        <div className="h-64 flex items-center justify-center bg-muted/30">
          <p className="text-sm text-destructive">{mapError}</p>
        </div>
      ) : (
        <div ref={mapContainer} className="h-64 md:h-80" />
      )}
    </div>
  );
};
