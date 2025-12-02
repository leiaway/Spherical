import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Track {
  id: string;
  title: string;
  play_count: number | null;
  cultural_context: string | null;
  artist: {
    id: string;
    name: string;
    is_emerging: boolean | null;
  } | null;
  genre: {
    id: string;
    name: string;
  } | null;
}

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  is_emerging: boolean | null;
  listener_count: number | null;
  image_url: string | null;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Region[];
    },
  });
};

export const useRegionTracks = (regionId: string | null) => {
  return useQuery({
    queryKey: ['region-tracks', regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          play_count,
          cultural_context,
          artist:artists(id, name, is_emerging),
          genre:genres(id, name)
        `)
        .eq('region_id', regionId)
        .order('play_count', { ascending: false });

      if (error) throw error;
      return data as Track[];
    },
    enabled: !!regionId,
  });
};

export const useRegionArtists = (regionId: string | null) => {
  return useQuery({
    queryKey: ['region-artists', regionId],
    queryFn: async () => {
      if (!regionId) return [];

      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('region_id', regionId)
        .order('listener_count', { ascending: false });

      if (error) throw error;
      return data as Artist[];
    },
    enabled: !!regionId,
  });
};

export const useEmergingArtists = () => {
  return useQuery({
    queryKey: ['emerging-artists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          region:regions(id, name, country)
        `)
        .eq('is_emerging', true)
        .order('listener_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};
