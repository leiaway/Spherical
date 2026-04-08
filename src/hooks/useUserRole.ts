import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import type { Session } from "@supabase/supabase-js";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthSession } from "@/hooks/useAuthSession";

export type UserRoleState = {
  session: Session | null;
  profile: Awaited<ReturnType<typeof getCurrentUserProfile>>;
  role: UserRole | null;
  isTalentScout: boolean;
  isLoading: boolean;
};

/**
 * Current auth session and profile for role-based UI. Session comes from React Query;
 * profile is keyed by user id and refetches when auth changes.
 */
export function useUserRole(): UserRoleState {
  const { data: session, isPending: sessionPending } = useAuthSession();
  const userId = session?.user?.id;

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: userId ? queryKeys.auth.profile(userId) : queryKeys.auth.profileNone,
    queryFn: () => getCurrentUserProfile(),
    enabled: !!userId,
  });

  const resolvedProfile = userId ? profile ?? null : null;
  const isLoading = sessionPending || (!!userId && profilePending);
  const role: UserRole | null = resolvedProfile?.role ?? null;
  const isTalentScout = role === "talent_scout";

  return {
    session: session ?? null,
    profile: resolvedProfile,
    role,
    isTalentScout,
    isLoading,
  };
}
