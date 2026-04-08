import type { Tables } from "@/integrations/supabase/types";

export type ScoutArtistRow = Tables<"artists"> & {
  region: { id: string; name: string; country: string } | null;
};

export type ArtistTrackStats = {
  trackCount: number;
  totalPlayCount: number;
  genreIds: Set<string>;
  genreNames: string[];
};

export type ScoutFilterState = {
  search: string;
  regionIds: string[];
  genreIds: string[];
  emergingOnly: boolean;
  listenerMin: number | null;
  listenerMax: number | null;
  totalPlaysMin: number | null;
  /** Only artists created in the last N days; null = no cutoff */
  createdWithinDays: number | null;
};

export const defaultScoutFilterState = (): ScoutFilterState => ({
  search: "",
  regionIds: [],
  genreIds: [],
  emergingOnly: false,
  listenerMin: null,
  listenerMax: null,
  totalPlaysMin: null,
  createdWithinDays: null,
});

export function aggregateTrackRows(
  rows: {
    artist_id: string;
    play_count: number | null;
    genre_id: string | null;
    genre: { id: string; name: string } | { id: string; name: string }[] | null;
  }[]
): Map<string, ArtistTrackStats> {
  const map = new Map<string, ArtistTrackStats>();

  for (const row of rows) {
    let agg = map.get(row.artist_id);
    if (!agg) {
      agg = {
        trackCount: 0,
        totalPlayCount: 0,
        genreIds: new Set(),
        genreNames: [],
      };
      map.set(row.artist_id, agg);
    }
    agg.trackCount += 1;
    agg.totalPlayCount += row.play_count ?? 0;
    if (row.genre_id) agg.genreIds.add(row.genre_id);
    const g = row.genre;
    if (g && !Array.isArray(g) && g.name) {
      if (!agg.genreNames.includes(g.name)) agg.genreNames.push(g.name);
    } else if (Array.isArray(g)) {
      for (const x of g) {
        if (x?.name && !agg.genreNames.includes(x.name)) agg.genreNames.push(x.name);
      }
    }
  }

  return map;
}

export function filterScoutArtists(
  artists: ScoutArtistRow[],
  statsByArtist: Map<string, ArtistTrackStats>,
  filters: ScoutFilterState
): ScoutArtistRow[] {
  const q = filters.search.trim().toLowerCase();

  return artists.filter((a) => {
    if (q && !a.name.toLowerCase().includes(q)) return false;
    if (filters.regionIds.length > 0 && (!a.region_id || !filters.regionIds.includes(a.region_id))) {
      return false;
    }
    if (filters.emergingOnly && !a.is_emerging) return false;
    const listeners = a.listener_count ?? 0;
    if (filters.listenerMin != null && listeners < filters.listenerMin) return false;
    if (filters.listenerMax != null && listeners > filters.listenerMax) return false;

    if (filters.createdWithinDays != null) {
      const created = new Date(a.created_at).getTime();
      const cutoff = Date.now() - filters.createdWithinDays * 86_400_000;
      if (created < cutoff) return false;
    }

    const stats = statsByArtist.get(a.id);
    if (filters.totalPlaysMin != null) {
      const tp = stats?.totalPlayCount ?? 0;
      if (tp < filters.totalPlaysMin) return false;
    }

    if (filters.genreIds.length > 0) {
      const gids = stats?.genreIds ?? new Set<string>();
      if (!filters.genreIds.some((id) => gids.has(id))) return false;
    }

    return true;
  });
}
