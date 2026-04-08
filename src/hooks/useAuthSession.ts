import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Cached Supabase session for the app. Invalidates on `onAuthStateChange` so all
 * `queryKeys.auth.*` consumers stay in sync.
 */
export function useAuthSession() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.root });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async (): Promise<Session | null> => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });
}

export function useAuthUserId() {
  const { data: session, ...rest } = useAuthSession();
  const userId = session?.user?.id ?? null;
  return { userId, session, ...rest };
}
