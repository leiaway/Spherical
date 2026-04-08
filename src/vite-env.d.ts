/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string | undefined;
  readonly VITE_MAPBOX_PUBLIC_TOKEN: string | undefined;
  /** Optional dev-only autofill for Talent Scout login; never commit real credentials. */
  readonly VITE_TEST_SCOUT_EMAIL?: string;
  readonly VITE_TEST_SCOUT_PASSWORD?: string;
}
