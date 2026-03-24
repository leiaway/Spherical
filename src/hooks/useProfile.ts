import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  home_country: string | null;
  location_enabled: boolean | null;
  current_latitude: number | null;
  current_longitude: number | null;
}

/**
 * Fetches the currently authenticated user's profile data.
 * Useful for resolving home_country and other preferences.
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
};
