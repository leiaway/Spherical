import { useQuery } from '@tanstack/react-query';
import {
  fetchRegions,
  fetchRegionTracks,
  fetchRegionArtists,
  fetchEmergingArtists,
  fetchGenres,
  fetchFestivals,
  fetchRegionByCountry,
} from '@/services/geoRecommendationService';

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
  audio_url: string | null;
  cover_image_url: string | null;
  duration_seconds: number | null;
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

export interface Genre {
  id: string;
  name: string;
  description: string | null;
}

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

/**
 * Fetches all regions ordered by name.
 * Used for the region picker and "Explore Other Frequencies" section.
 *
 * @example
 * const { data: regions, isLoading } = useRegions();
 * return <RegionPicker regions={regions ?? []} onRegionChange={setRegionId} />;
 */
export const useRegions = () => {
  return useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegions,
  });
};

/**
 * Fetches tracks for a given region, ordered by play_count descending.
 * Query is disabled when regionId is null.
 *
 * @param regionId - Region UUID or null to disable the query
 */
export const useRegionTracks = (regionId: string | null) => {
  return useQuery<Track[]>({
    queryKey: ['region-tracks', regionId],
    queryFn: () => fetchRegionTracks(regionId as string),
    enabled: !!regionId,
  });
};

/**
 * Fetches artists for a given region, ordered by listener_count descending.
 * Powers artist promotion insights (F1.7 / F4.3) and talent scout views (F1.9 / F2.7).
 *
 * @param regionId - Region UUID or null to disable the query
 */
export const useRegionArtists = (regionId: string | null) => {
  return useQuery<Artist[]>({
    queryKey: ['region-artists', regionId],
    queryFn: () => fetchRegionArtists(regionId as string),
    enabled: !!regionId,
  });
};

/**
 * Fetches up to 10 emerging artists across all regions, ordered by listener_count.
 * Powers the "Trending Local Artists" discovery view (F1.9).
 */
export const useEmergingArtists = () => {
  return useQuery({
    queryKey: ['emerging-artists'],
    queryFn: fetchEmergingArtists,
  });
};

/**
 * Fetches all genres ordered by name.
 * Used to populate genre dropdowns in track upload forms (F20.1).
 */
export const useGenres = () => {
  return useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: fetchGenres,
  });
};

/**
 * Fetches festivals for a given region, ordered by typical_month.
 * Used in the Mood & Festivals discovery tab (F1.6 / F2.6).
 *
 * @param regionId - Region UUID or null to disable
 */
export const useFestivals = (regionId: string | null) => {
  return useQuery<Festival[]>({
    queryKey: ['festivals', regionId],
    queryFn: () => fetchFestivals(regionId as string),
    enabled: !!regionId,
  });
};

/**
 * Fetches a single region matched by exact country string.
 * Useful for resolving user profile location strings to system regions (F1.2).
 *
 * @param country - Exact country string or null to disable
 */
export const useRegionByCountry = (country: string | null) => {
  return useQuery<Region | null>({
    queryKey: ['region', 'country', country],
    queryFn: () => fetchRegionByCountry(country as string),
    enabled: !!country,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — region-country mapping rarely changes
  });
};

