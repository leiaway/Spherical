import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Requirement: F5 (international/cultural music recommendations). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Track as returned from the API with artist and genre relations.
 * @see useRegionTracks
 */
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

/**
 * Artist with optional region relation.
 * @see useRegionArtists, useEmergingArtists
 */
export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  is_emerging: boolean | null;
  listener_count: number | null;
  image_url: string | null;
}

/**
 * Region (geographic music region) from the regions table.
 * @see useRegions
 */
export interface Region {
  id: string;
  name: string;
  country: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Fetches all regions from Supabase, ordered by name.
 * Used for the region picker and "Explore Other Frequencies" section.
 *
 * **Side effects:** Single fetch from Supabase on mount (or when query key changes).
 *
 * @returns UseQueryResult with `data: Region[]` (id, name, country, description, latitude, longitude)
 *
 * @example
 * const { data: regions, isLoading } = useRegions();
 * return <RegionPicker regions={regions ?? []} onRegionChange={setRegionId} />;
 */
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

/**
 * Fetches tracks for a given region from Supabase, with artist and genre joins.
 * Ordered by play_count descending. Query is disabled when regionId is null.
 *
 * **Side effects:** Fetches from Supabase when regionId is non-null.
 *
 * @param regionId - Region UUID or null to disable the query
 * @returns UseQueryResult with `data: Track[]` (title, play_count, artist, genre, cultural_context)
 *
 * @example
 * const { data: tracks } = useRegionTracks(selectedRegionId);
 * tracks?.map(t => <TrackCard key={t.id} track={t} />)
 */
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

/**
 * Fetches artists for a given region from Supabase.
 * Ordered by listener_count descending. Query is disabled when regionId is null.
 *
 * **Side effects:** Fetches from Supabase when regionId is non-null.
 *
 * @param regionId - Region UUID or null to disable the query
 * @returns UseQueryResult with `data: Artist[]` (name, bio, is_emerging, listener_count, image_url)
 */
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

/**
 * Fetches up to 10 emerging artists (is_emerging = true) across all regions.
 * Includes region relation. Ordered by listener_count descending.
 *
 * **Side effects:** Single fetch from Supabase on mount.
 *
 * @returns UseQueryResult with array of artists plus region { id, name, country }
 */
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

/**
 * Fetches all genres from Supabase, ordered by name.
 * Used to populate genre dropdowns in track upload forms (F1.4).
 *
 * @returns UseQueryResult with `data: Genre[]`
 */
export interface Genre {
  id: string;
  name: string;
  description: string | null;
}

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Genre[];
    },
  });
};

/**
 * Fetches festivals for a given region, ordered by typical_month.
 * Used in the Mood & Festivals discovery tab (F1.6).
 *
 * @param regionId - Region UUID or null to disable
 * @returns UseQueryResult with festival rows including joined genre
 */
export interface Festival {
  id: string;
  name: string;
  region_id: string;
  description: string | null;
  typical_month: number | null;
  mood: string | null;
  genre_id: string | null;
  genre: { id: string; name: string } | null;
}

export const useFestivals = (regionId: string | null) => {
  return useQuery({
    queryKey: ['festivals', regionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('festivals')
        .select('*, genre:genres(id, name)')
        .eq('region_id', regionId!)
        .order('typical_month');
      if (error) throw error;
      return data as Festival[];
    },
    enabled: !!regionId,
  });
};

/**
 * Fetches a single region entity based on an exact country string match.
 * Useful for matching user profile strings to system regions (F1.2 requirement).
 * @param country The exact string representing the region's country.
 * @returns UseQueryResult with `data: Region | null`
 */
export const useRegionByCountry = (country: string | null) => {
  return useQuery({
    queryKey: ['region', 'country', country],
    queryFn: async () => {
      if (!country) return null;

      const { data, error } = await supabase
        .from('regions')
        .select('id, name, country, description, latitude, longitude')
        .eq('country', country)
        .maybeSingle(); // In case there is no mapping

      if (error) throw error;
      return data as Region | null;
    },
    enabled: !!country,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
