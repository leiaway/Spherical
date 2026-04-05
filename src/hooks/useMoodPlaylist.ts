import { useQuery } from '@tanstack/react-query';
import { fetchMoodPlaylist, fetchFestivalPlaylist } from '@/services/geoRecommendationService';
import type { Track } from '@/hooks/useRegions';

/** Requirement: F1.6 (playlists reflecting local mood or festivals). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Generates a mood-based playlist for a region (F1.6 / F2.6 / F20.3).
 * Delegates to geoRecommendationService which calls the `generate_mood_playlist` RPC.
 *
 * @param regionId - Region UUID or null to disable
 * @param mood     - Mood string (e.g. 'festive', 'chill') or null to disable
 */
export const useMoodPlaylist = (regionId: string | null, mood: string | null) => {
  return useQuery<Track[]>({
    queryKey: ['mood-playlist', regionId, mood],
    queryFn: () => fetchMoodPlaylist(regionId as string, mood as string),
    enabled: !!regionId && !!mood,
  });
};

/**
 * Generates a festival playlist (F20.3).
 * Delegates to geoRecommendationService which calls the `generate_festival_playlist` RPC.
 *
 * @param festivalId - Festival UUID or null to disable
 */
export const useFestivalPlaylist = (festivalId: string | null) => {
  return useQuery<Track[]>({
    queryKey: ['festival-playlist', festivalId],
    queryFn: () => fetchFestivalPlaylist(festivalId as string),
    enabled: !!festivalId,
  });
};
