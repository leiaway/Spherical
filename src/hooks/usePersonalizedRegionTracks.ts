import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Track } from '@/hooks/useRegions';

/** Requirement: F1.5 (regionally relevant, personalized suggestions). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Fetches tracks for a region, ordered so tracks the user has heard least appear first.
 * Calls the `get_personalized_region_tracks` Supabase function when a userId is provided.
 * Falls back to plain play_count ordering for unauthenticated users.
 *
 * @param regionId - Region UUID or null to disable the query
 * @param userId   - Authenticated user's UUID, or null for anonymous fallback
 * @returns UseQueryResult with `data: Track[]`
 */
export const usePersonalizedRegionTracks = (
  regionId: string | null,
  userId: string | null
) => {
  return useQuery({
    queryKey: ['personalized-region-tracks', regionId, userId],
    queryFn: async () => {
      if (!regionId) return [];

      // Anonymous users: fall back to global play_count ordering
      if (!userId) {
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
      }

      // Authenticated users: personalized ordering via RPC
      const { data, error } = await supabase
        .rpc('get_personalized_region_tracks', {
          p_user_id: userId,
          p_region_id: regionId,
        });

      if (error) throw error;

      // Map the flat RPC rows into the Track interface shape
      return ((data as Record<string, unknown>[]) ?? []).map((row) => ({
        id: row.id as string,
        title: row.title as string,
        play_count: row.play_count as number | null,
        cultural_context: row.cultural_context as string | null,
        artist: row.artist_id
          ? {
              id: row.artist_id as string,
              name: row.artist_name as string,
              is_emerging: row.artist_is_emerging as boolean | null,
            }
          : null,
        genre: row.genre_id
          ? {
              id: row.genre_id as string,
              name: row.genre_name as string,
            }
          : null,
      })) as Track[];
    },
    enabled: !!regionId,
  });
};
