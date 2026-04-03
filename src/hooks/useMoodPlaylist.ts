import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Track } from '@/hooks/useRegions';

/** Requirement: F1.6 (playlists reflecting local mood or festivals). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Generates a mood-based playlist for a region by calling the
 * `generate_mood_playlist` Supabase function, then fetching full track data.
 *
 * @param regionId - Region UUID or null to disable
 * @param mood     - Mood string (e.g. 'festive', 'chill') or null to disable
 */
export const useMoodPlaylist = (regionId: string | null, mood: string | null) => {
  return useQuery({
    queryKey: ['mood-playlist', regionId, mood],
    queryFn: async () => {
      if (!regionId || !mood) return [];

      const { data: ids, error: rpcError } = await supabase
        .rpc('generate_mood_playlist', {
          p_region_id: regionId,
          p_mood: mood,
        });

      if (rpcError) throw rpcError;

      const trackIds = ((ids as { track_id: string }[]) ?? []).map((r) => r.track_id);
      if (trackIds.length === 0) return [];

      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          play_count,
          cultural_context,
          artist:artists(id, name, is_emerging),
          genre:genres(id, name)
        `)
        .in('id', trackIds);

      if (tracksError) throw tracksError;
      return tracks as Track[];
    },
    enabled: !!regionId && !!mood,
  });
};

/**
 * Generates a festival playlist by calling the `generate_festival_playlist`
 * Supabase function, then fetching full track data.
 *
 * @param festivalId - Festival UUID or null to disable
 */
export const useFestivalPlaylist = (festivalId: string | null) => {
  return useQuery({
    queryKey: ['festival-playlist', festivalId],
    queryFn: async () => {
      if (!festivalId) return [];

      const { data: ids, error: rpcError } = await supabase
        .rpc('generate_festival_playlist', {
          p_festival_id: festivalId,
        });

      if (rpcError) throw rpcError;

      const trackIds = ((ids as { track_id: string }[]) ?? []).map((r) => r.track_id);
      if (trackIds.length === 0) return [];

      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          play_count,
          cultural_context,
          artist:artists(id, name, is_emerging),
          genre:genres(id, name)
        `)
        .in('id', trackIds);

      if (tracksError) throw tracksError;
      return tracks as Track[];
    },
    enabled: !!festivalId,
  });
};
