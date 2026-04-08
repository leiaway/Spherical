import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = ProfileRow["role"];

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

  const { data, error } = await supabase.rpc("is_talent_scout");
  if (!error && typeof data === "boolean") {
    return data;
  }
  const profile = await getCurrentUserProfile();
  return profile?.role === "talent_scout";
}
