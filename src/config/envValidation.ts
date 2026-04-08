export function requireEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

export function validateUrl(name: string, value: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`[env] ${name} must be a valid URL`);
  }
}

export function optionalTrimmed(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t === '' ? undefined : t;
}
