import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export type MapProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
};

/**
 * Public map markers from `profiles_for_user_map` (RLS-safe). Polls on an interval
 * because realtime is not reliable for anonymous clients on `profiles`.
 */
export function useProfilesForUserMap() {
  return useQuery({
    queryKey: queryKeys.map.profilesForUserMap,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("profiles_for_user_map");
      if (error) throw error;
      return (data ?? []) as MapProfileRow[];
    },
    refetchInterval: 45_000,
    staleTime: 30_000,
  });
}
