import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = "user" | "artist" | "talent_scout";
const USER_ROLE_ID_COLUMNS = ["user_id", "profile_id", "id"] as const;
type UserRolesLookupResult = { role?: unknown };
type UntypedSupabaseClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string
      ) => Promise<{ data: UserRolesLookupResult[] | null; error: unknown }>;
    };
  };
};

/**
 * Fetches the current user's profile. Returns null if not signed in or no profile row.
 */
export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

/**
 * Fetches role(s) from public.user_roles for a user id.
 * Tries common FK column names so this remains compatible with older schemas.
 */
async function getRoleFromUserRoles(userId: string): Promise<UserRole | null> {
  const untypedClient = supabase as unknown as UntypedSupabaseClient;

  for (const idColumn of USER_ROLE_ID_COLUMNS) {
    const { data, error } = await untypedClient
      .from("user_roles")
      .select("role")
      .eq(idColumn, userId);

    if (error || !Array.isArray(data) || data.length === 0) continue;

    const roles = data
      .map((row) => row.role)
      .filter(
        (role): role is UserRole =>
          role === "user" || role === "artist" || role === "talent_scout"
      );

    if (roles.includes("talent_scout")) return "talent_scout";
    return roles[0] ?? null;
  }

  return null;
}

/**
 * Resolves the current user's role from user_roles first, then legacy profile fallback.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const roleFromUserRoles = await getRoleFromUserRoles(userId);
  if (roleFromUserRoles) return roleFromUserRoles;

  const profile = await getCurrentUserProfile();
  if (profile?.role === "talent_scout") return "talent_scout";
  if (profile?.role === "user") return "user";
  return null;
}

/**
 * Returns true only if the current user has the talent_scout role.
 * Used to gate the Talent Scout login and dashboard.
 *
 * Phase 2/3: Prefer the `is_talent_scout` DB RPC so we do not transfer the full profile row
 * (including `role`) when only a boolean gate is needed. Falls back to profile fetch if the
 * RPC is missing (e.g. local DB not migrated yet).
 */
export async function isTalentScout(): Promise<boolean> {
  // Avoid anonymous RPC calls when no authenticated session exists.
  // This prevents extra role-check requests that could reveal auth-state timing in network logs.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return false;

  const roleFromUserRoles = await getRoleFromUserRoles(session.user.id);
  if (roleFromUserRoles) {
    return roleFromUserRoles === "talent_scout";
  }

  const { data, error } = await supabase.rpc("is_talent_scout");
  if (!error && typeof data === "boolean") {
    return data;
  }
  const profile = await getCurrentUserProfile();
  return profile?.role === "talent_scout";
}
