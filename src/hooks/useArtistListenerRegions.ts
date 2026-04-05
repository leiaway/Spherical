import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Requirement: F1.7 (artist promotion insights). See docs/REQUIREMENTS_REFERENCE.md */

export interface ArtistListenerRegion {
  region_id: string;
  region_name: string;
  play_count: number;
}

/**
 * Returns the regions where a given artist's tracks have been played,
 * ranked by total play count. Used to show artists where their audience is.
 *
 * @param artistId - Artist UUID or null to disable
 */
export const useArtistListenerRegions = (artistId: string | null) => {
  return useQuery<ArtistListenerRegion[]>({
    queryKey: ['artist-listener-regions', artistId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_artist_listener_regions', {
        p_artist_id: artistId as string,
      });
      if (error) throw error;
      return (data ?? []) as ArtistListenerRegion[];
    },
    enabled: !!artistId,
    staleTime: 1000 * 60 * 10,
  });
};
