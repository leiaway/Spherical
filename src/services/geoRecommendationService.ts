import { supabase } from '@/integrations/supabase/client';
import type { Track, Artist, Region, Genre, Festival } from '@/hooks/useRegions';

/**
 * Data-access layer for all geo-based recommendation queries.
 *
 * Principle applied: Separation of Concerns — React hooks manage state; this service
 * owns every Supabase query related to geographic music discovery.
 * Centralising here eliminates the duplicated track SELECT block that was copy-pasted
 * across useRegionTracks, usePersonalizedRegionTracks, useMoodPlaylist, and useFestivalPlaylist.
 *
 * Requirements: F1.6, F2.1, F2.4, F2.6, F4.3, F20.1–F20.3
 * See docs/REQUIREMENTS_REFERENCE.md
 */

// ---------------------------------------------------------------------------
// Shared internals
// ---------------------------------------------------------------------------

/**
 * The track SELECT fragment used by every query that returns a Track[].
 * Defined once here so any schema change (e.g. adding `bpm`) is applied everywhere.
 *
 * NOTE: This is intentionally a function call (not a string constant) because
 * Supabase's TypeScript SDK loses type inference when a variable is passed to
 * .select() — the literal must appear at the call site. The duplication removed
 * here is in the *service functions*, not in inline TS generics.
 */
const TRACK_SELECT =
  'id, title, play_count, cultural_context, audio_url, cover_image_url, duration_seconds, artist:artists(id, name, is_emerging), genre:genres(id, name)';

/**
 * Maps a flat RPC result row to the Track interface.
 * RPC functions return denormalised rows (artist_id, artist_name, …) while the
 * REST select returns nested objects — this mapper normalises to one shape.
 */
export const mapRpcRowToTrack = (row: Record<string, unknown>): Track => ({
  id: row.id as string,
  title: row.title as string,
  play_count: row.play_count as number | null,
  cultural_context: row.cultural_context as string | null,
  audio_url: (row.audio_url as string | null) ?? null,
  cover_image_url: (row.cover_image_url as string | null) ?? null,
  duration_seconds: (row.duration_seconds as number | null) ?? null,
  artist: row.artist_id
    ? {
        id: row.artist_id as string,
        name: row.artist_name as string,
        is_emerging: row.artist_is_emerging as boolean | null,
      }
    : null,
  genre: row.genre_id
    ? { id: row.genre_id as string, name: row.genre_name as string }
    : null,
});

/**
 * Fetches full Track objects for a list of track IDs.
 * Shared by fetchMoodPlaylist and fetchFestivalPlaylist — both call an RPC to get IDs,
 * then hydrate those IDs into full Track shapes via this helper.
 */
export const fetchTracksByIds = async (trackIds: string[]): Promise<Track[]> => {
  if (trackIds.length === 0) return [];

  const { data, error } = await supabase
    .from('tracks')
    .select(TRACK_SELECT)
    .in('id', trackIds);

  if (error) throw error;
  return (data ?? []) as Track[];
};

// ---------------------------------------------------------------------------
// Region queries
// ---------------------------------------------------------------------------

/** Fetches all regions ordered by name. */
export const fetchRegions = async (): Promise<Region[]> => {
  const { data, error } = await supabase.from('regions').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Region[];
};

/** Fetches a single region matched by exact country string, or null if not found. */
export const fetchRegionByCountry = async (country: string): Promise<Region | null> => {
  const { data, error } = await supabase
    .from('regions')
    .select('id, name, country, description, latitude, longitude')
    .eq('country', country)
    .maybeSingle();

  if (error) throw error;
  return data as Region | null;
};

// ---------------------------------------------------------------------------
// Track queries
// ---------------------------------------------------------------------------

/**
 * Fetches tracks for a region ordered by play_count descending.
 * Used when no authenticated user context is available.
 */
export const fetchRegionTracks = async (regionId: string): Promise<Track[]> => {
  const { data, error } = await supabase
    .from('tracks')
    .select(TRACK_SELECT)
    .eq('region_id', regionId)
    .order('play_count', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Track[];
};

/**
 * Fetches personalised track recommendations for a region.
 * Authenticated path: calls the `get_personalized_region_tracks` RPC which orders
 * tracks the user has heard least to the top (novelty-first).
 * Anonymous path: falls back to fetchRegionTracks (play_count ordering).
 */
export const fetchPersonalizedRegionTracks = async (
  regionId: string,
  userId: string | null,
): Promise<Track[]> => {
  if (!userId) return fetchRegionTracks(regionId);

  const { data, error } = await supabase.rpc('get_personalized_region_tracks', {
    p_user_id: userId,
    p_region_id: regionId,
  });

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(mapRpcRowToTrack);
};

/**
 * Generates a mood-based playlist for a region (F1.6 / F2.6 / F20.3).
 * Calls `generate_mood_playlist` RPC → resolves track IDs → hydrates into Track[].
 */
export const fetchMoodPlaylist = async (regionId: string, mood: string): Promise<Track[]> => {
  const { data: ids, error: rpcError } = await supabase.rpc('generate_mood_playlist', {
    p_region_id: regionId,
    p_mood: mood,
  });

  if (rpcError) throw rpcError;

  const trackIds = ((ids as { track_id: string }[]) ?? []).map((r) => r.track_id);
  return fetchTracksByIds(trackIds);
};

/**
 * Generates a festival playlist (F20.3).
 * Calls `generate_festival_playlist` RPC → resolves track IDs → hydrates into Track[].
 */
export const fetchFestivalPlaylist = async (festivalId: string): Promise<Track[]> => {
  const { data: ids, error: rpcError } = await supabase.rpc('generate_festival_playlist', {
    p_festival_id: festivalId,
  });

  if (rpcError) throw rpcError;

  const trackIds = ((ids as { track_id: string }[]) ?? []).map((r) => r.track_id);
  return fetchTracksByIds(trackIds);
};

// ---------------------------------------------------------------------------
// Artist queries
// ---------------------------------------------------------------------------

/**
 * Fetches artists for a region ordered by listener_count descending.
 * Used by the talent scout dashboard (F1.9 / F2.7) and artist promotion insights (F1.7 / F4.3).
 */
export const fetchRegionArtists = async (regionId: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('region_id', regionId)
    .order('listener_count', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Artist[];
};

/**
 * Fetches tracks from regions other than the given one, ordered by play_count (F2.3).
 * Powers the "World Music" discovery tab for cross-cultural recommendations.
 */
export const fetchMulticulturalTracks = async (excludeRegionId: string, limit = 20): Promise<Track[]> => {
  const { data, error } = await supabase.rpc('get_multicultural_tracks', {
    p_exclude_region_id: excludeRegionId,
    p_limit: limit,
  });

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(mapRpcRowToTrack);
};

/**
 * Fetches up to 10 emerging artists across all regions, ordered by listener_count.
 * Powers the "Trending Local Artists" view (F1.9).
 */
export const fetchEmergingArtists = async () => {
  const { data, error } = await supabase
    .from('artists')
    .select('*, region:regions(id, name, country)')
    .eq('is_emerging', true)
    .order('listener_count', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
};

// ---------------------------------------------------------------------------
// Supporting lookups
// ---------------------------------------------------------------------------

/** Fetches all genres ordered by name. Used by track upload forms (F20.1). */
export const fetchGenres = async (): Promise<Genre[]> => {
  const { data, error } = await supabase.from('genres').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Genre[];
};

/**
 * Fetches festivals for a region ordered by typical_month.
 * Used in the Mood & Festivals discovery tab (F1.6 / F2.6).
 */
export const fetchFestivals = async (regionId: string): Promise<Festival[]> => {
  const { data, error } = await supabase
    .from('festivals')
    .select('*, genre:genres(id, name)')
    .eq('region_id', regionId)
    .order('typical_month');

  if (error) throw error;
  return (data ?? []) as Festival[];
};
