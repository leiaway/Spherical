import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';

/** Requirement: F1.8 (artist collaboration with nearby creators). See docs/REQUIREMENTS_REFERENCE.md */

export interface NearbyCreator {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_region_id: string | null;
  home_country: string | null;
}

/**
 * Returns profiles that share the current user's current_region_id,
 * excluding self and existing friends/pending requests.
 * Disabled when the user is not authenticated or has no region set.
 *
 * @example
 * const { data: creators } = useNearbyCreators(currentRegionId);
 */
export const useNearbyCreators = (regionId: string | null) => {
  const { user } = useAuth();
  const { friends, pendingRequests } = useFriends();

  return useQuery<NearbyCreator[]>({
    queryKey: ['nearby-creators', regionId, user?.id],
    queryFn: async () => {
      if (!regionId || !user) return [];

      // Collect IDs to exclude: self + friends + pending requests (both directions)
      const excludeIds = new Set<string>([user.id]);
      friends.forEach((f) => {
        const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
        excludeIds.add(otherId);
      });
      pendingRequests.forEach((r) => {
        excludeIds.add(r.user_id === user.id ? r.friend_id : r.user_id);
      });

      let query = supabase
        .from('profiles')
        .select('id, display_name, avatar_url, current_region_id, home_country')
        .eq('current_region_id', regionId)
        .limit(20);

      // Supabase doesn't support NOT IN natively on arrays in all versions;
      // filter client-side after fetch (list is small — 20 rows max).
      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).filter(
        (p) => !excludeIds.has(p.id),
      ) as NearbyCreator[];
    },
    enabled: !!regionId && !!user,
    staleTime: 1000 * 60 * 5,
  });
};