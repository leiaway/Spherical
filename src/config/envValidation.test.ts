import { describe, expect, it, vi } from 'vitest';
import { optionalTrimmed, requireEnv, validateUrl } from './envValidation';

describe('requireEnv', () => {
  it('returns the value when defined and non-empty', () => {
    expect(requireEnv('VITE_FOO', 'bar')).toBe('bar');
  });

  it('throws with variable name when value is undefined', () => {
    expect(() => requireEnv('VITE_SUPABASE_URL', undefined)).toThrow(
      '[env] Missing required environment variable: VITE_SUPABASE_URL'
    );
  });

  it('throws when value is empty string', () => {
    expect(() => requireEnv('VITE_X', '')).toThrow(
      '[env] Missing required environment variable: VITE_X'
    );
  });

  it('throws when value is whitespace only', () => {
    expect(() => requireEnv('VITE_X', '   \t')).toThrow(
      '[env] Missing required environment variable: VITE_X'
    );
  });
});

describe('validateUrl', () => {
  it('accepts a valid https URL', () => {
    expect(validateUrl('VITE_SUPABASE_URL', 'https://abc.supabase.co')).toBe(
      'https://abc.supabase.co'
    );
  });

  it('throws when URL is invalid', () => {
    expect(() => validateUrl('VITE_SUPABASE_URL', 'not-a-url')).toThrow(
      '[env] VITE_SUPABASE_URL must be a valid URL'
    );
  });
});

describe('optionalTrimmed', () => {
  it('returns undefined for undefined', () => {
    expect(optionalTrimmed(undefined)).toBeUndefined();
  });

  it('returns undefined for empty or whitespace', () => {
    expect(optionalTrimmed('')).toBeUndefined();
    expect(optionalTrimmed('  ')).toBeUndefined();
  });

  it('returns trimmed token when present', () => {
    expect(optionalTrimmed('  pk.token  ')).toBe('pk.token');
  });
});

describe('env module (integration)', () => {
  it('resolves env object when required vars are set (Vitest stubEnv)', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-anon-key');
    vi.stubEnv('VITE_MAPBOX_PUBLIC_TOKEN', '  pk.test  ');
    vi.resetModules();
    const { env } = await import('./env');

    expect(env.supabaseUrl).toBe('https://test.supabase.co');
    expect(env.supabaseAnonKey).toBe('test-anon-key');
    expect(env.mapboxPublicToken).toBe('pk.test');

    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
