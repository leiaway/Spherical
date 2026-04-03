// src/lib/shuffle.ts
// Core shuffle algorithm prioritizing least-played songs
// Based on F6.1-shuffle-algorithm-design.md

export interface TrackPlayInfo {
  id: string;
  playCount: number;
  lastPlayed: Date | null;
}

export interface ShuffleOptions {
  recentTrackIds?: string[]; // Exclude these tracks (recently played)
  recentMinutes?: number; // Exclude tracks played within this many minutes
  now?: Date; // For testing, override current time
}

function hoursSince(date: Date | null, now: Date): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}

export function calculateTrackWeight(
  playCount: number,
  lastPlayed: Date | null,
  now: Date
): number {
  // Never played bonus
  if (playCount === 0) return 2.0;
  // Base weight (inverse play count)
  const baseWeight = 1 / (1 + playCount);
  // Recency factor
  const hours = hoursSince(lastPlayed, now);
  const recency = Math.min(1.0, 0.1 + (hours / 24) * 0.9);
  return baseWeight * recency;
}

export function shuffleTracks(
  tracks: TrackPlayInfo[],
  options: ShuffleOptions = {}
): string[] {
  const now = options.now || new Date();
  // Filter out recently played tracks
  let filtered = tracks;
  if (options.recentTrackIds && options.recentTrackIds.length > 0) {
    filtered = filtered.filter(t => !options.recentTrackIds!.includes(t.id));
  }
  if (options.recentMinutes) {
    const minAgo = now.getTime() - options.recentMinutes * 60 * 1000;
    filtered = filtered.filter(t => !t.lastPlayed || t.lastPlayed.getTime() < minAgo);
  }
  // Calculate weights
  const weights = filtered.map(t => calculateTrackWeight(t.playCount, t.lastPlayed, now));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  // Weighted shuffle (Fisher-Yates with weights)
  const result: string[] = [];
  const pool = filtered.slice();
  const poolWeights = weights.slice();
  while (pool.length > 0) {
    // Normalize weights
    const sum = poolWeights.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      // All weights zero, pick randomly
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool[idx].id);
      pool.splice(idx, 1);
      poolWeights.splice(idx, 1);
      continue;
    }
    // Weighted random selection
    let r = Math.random() * sum;
    let idx = 0;
    while (r > poolWeights[idx]) {
      r -= poolWeights[idx];
      idx++;
    }
    result.push(pool[idx].id);
    pool.splice(idx, 1);
    poolWeights.splice(idx, 1);
  }
  return result;
}
