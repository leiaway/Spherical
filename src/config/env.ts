import { optionalTrimmed, requireEnv, validateUrl } from './envValidation';

export const env = {
  supabaseUrl: validateUrl(
    'VITE_SUPABASE_URL',
    requireEnv('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL)
  ),
  supabaseAnonKey: requireEnv(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
  /** Mapbox public token; optional so the app can run without the map configured. */
  mapboxPublicToken: optionalTrimmed(import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN),
} as const;
