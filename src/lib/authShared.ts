import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/**
 * Phase 1: Single minimum length for password fields on sign-in forms so Talent Scout
 * and main Auth behave the same client-side (Supabase still enforces its own rules server-side).
 */
export const AUTH_SIGN_IN_PASSWORD_MIN_LENGTH = 8;

/** Phase 1: Shared Zod rule for email + password sign-in flows. */
export const authSignInPasswordSchema = z
  .string()
  .min(
    AUTH_SIGN_IN_PASSWORD_MIN_LENGTH,
    `Password must be at least ${AUTH_SIGN_IN_PASSWORD_MIN_LENGTH} characters`
  );

/**
 * Phase 1: One generic user-facing message so we do not reveal whether the account exists,
 * the password was wrong, or the user is not a talent_scout (reduces account/role probing).
 */
export const SCOUT_PORTAL_SIGN_IN_GENERIC_TITLE = "Sign in failed";
export const SCOUT_PORTAL_SIGN_IN_GENERIC_DESCRIPTION =
  "Invalid credentials. Check your email and password, or use FREQUENCY sign-in.";

/** Phase 1: Centralized email/password sign-in for consistent behavior across pages. */
export async function signInWithEmailPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

/**
 * Phase 3: After a successful password check, Supabase issues a session before we can verify
 * scout role in app code. For users who are not scouts, revoke refresh tokens globally so
 * the access token window is closed server-side immediately (stricter than local-only signOut).
 *
 * Note: This ends every session for this user on all devices — appropriate when they attempted
 * the restricted Talent Scout portal with valid non-scout credentials.
 */
export async function revokeAllSessionsAfterFailedScoutPortalGate(): Promise<void> {
  await supabase.auth.signOut({ scope: "global" });
}
