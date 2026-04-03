/** Thrown when a coordinate fails validation; rethrown from geolocation flow so bad `regions` rows surface in dev. */
export class InvalidCoordinateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCoordinateError';
  }
}

/**
 * Computes the great-circle distance between two WGS84-style coordinates using the Haversine formula.
 *
 * Assumes a spherical Earth with mean radius 6371 km. Accurate for most consumer geo use cases;
 * not a substitute for geodesy libraries when ellipsoid or high precision is required.
 *
 * Region coordinates come from Supabase; invalid values throw so data-integrity problems are visible
 * in development (e.g. error overlay / monitoring) instead of failing silently in the nearest-region loop.
 *
 * @param lat1 - Latitude of the first point in decimal degrees, range [-90, 90]
 * @param lon1 - Longitude of the first point in decimal degrees, range [-180, 180]
 * @param lat2 - Latitude of the second point in decimal degrees, range [-90, 90]
 * @param lon2 - Longitude of the second point in decimal degrees, range [-180, 180]
 * @param secondPointLabel - Optional label for the second point (e.g. region row id) included when lat2/lon2 are invalid
 * @returns Distance in kilometres (non-negative)
 * @throws {InvalidCoordinateError} When any argument is not a finite number or is outside valid latitude/longitude ranges
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  secondPointLabel?: string
): number {
  const isValidLat = (v: number) => Number.isFinite(v) && v >= -90 && v <= 90;
  const isValidLon = (v: number) => Number.isFinite(v) && v >= -180 && v <= 180;

  if (!isValidLat(lat1)) {
    throw new InvalidCoordinateError(`Invalid Latitude: ${lat1}`);
  }
  if (!isValidLon(lon1)) {
    throw new InvalidCoordinateError(`Invalid Longitude: ${lon1}`);
  }
  if (!isValidLat(lat2)) {
    throw new InvalidCoordinateError(
      secondPointLabel
        ? `Invalid Latitude (${secondPointLabel}): ${lat2}`
        : `Invalid Latitude: ${lat2}`
    );
  }
  if (!isValidLon(lon2)) {
    throw new InvalidCoordinateError(
      secondPointLabel
        ? `Invalid Longitude (${secondPointLabel}): ${lon2}`
        : `Invalid Longitude: ${lon2}`
    );
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const aClamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped));
  return R * c;
}
