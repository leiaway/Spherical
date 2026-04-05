import { useQuery } from '@tanstack/react-query';
import { fetchPersonalizedRegionTracks } from '@/services/geoRecommendationService';
import type { Track } from '@/hooks/useRegions';

/** Requirement: F1.5 (regionally relevant, personalized suggestions). See docs/REQUIREMENTS_REFERENCE.md */

/**
 * Fetches tracks for a region, ordered so tracks the user has heard least appear first.
 * Delegates to geoRecommendationService — authenticated users get the personalized RPC path;
 * anonymous users fall back to play_count ordering.
 *
 * @param regionId - Region UUID or null to disable the query
 * @param userId   - Authenticated user's UUID, or null for anonymous fallback
 * @returns UseQueryResult with `data: Track[]`
 */
export const usePersonalizedRegionTracks = (
  regionId: string | null,
  userId: string | null,
) => {
  return useQuery<Track[]>({
    queryKey: ['personalized-region-tracks', regionId, userId],
    queryFn: () => fetchPersonalizedRegionTracks(regionId as string, userId),
    enabled: !!regionId,
  });
};
