import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Requirement: F1.3 (connect users sharing musical background). See docs/REQUIREMENTS_REFERENCE.md */

export interface SuggestedFriend {
  profile_id: string;
  display_name: string | null;
  avatar_url: string | null;
  taste_score: number;
  match_reason: 'genre_overlap' | 'home_country';
}

/**
 * Returns up to 10 suggested friends scored by shared genre listening history.
 * Falls back to home_country matching when the user has no listening history.
 * Disabled when the user is not authenticated.
 *
 * @example
 * const { data: suggestions } = useSuggestedFriends();
 * suggestions?.map(s => <SuggestedFriendRow key={s.profile_id} suggestion={s} />)
 */
export const useSuggestedFriends = () => {
  return useQuery({
    queryKey: ['suggested-friends'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .rpc('get_suggested_friends', { p_user_id: user.id });



      if (error) throw error;
      return (data ?? []) as SuggestedFriend[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes — suggestions don't need live updates
  });
};
