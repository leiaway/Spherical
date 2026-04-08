import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import type { ArtistTrackStats, ScoutArtistRow } from "@/lib/scoutArtistFilters";
import { aggregateTrackRows } from "@/lib/scoutArtistFilters";

function sortedIdsKey(ids: string[]): string {
  return [...ids].sort().join(",");
}

/** Full artist rows for IDs the scout has saved (order preserved). */
export function useScoutSavedArtistsDetail(userId: string | null, savedIds: string[]) {
  const idsKey = sortedIdsKey(savedIds);

  return useQuery({
    queryKey: queryKeys.scout.savedArtistsDetail(userId, idsKey),
    queryFn: async (): Promise<ScoutArtistRow[]> => {
      if (!userId || savedIds.length === 0) return [];

      const { data, error } = await supabase
        .from("artists")
        .select(`*, region:regions(id, name, country)`)
        .in("id", savedIds);

      if (error) throw error;

      const order = new Map(savedIds.map((id, i) => [id, i]));
      return ((data ?? []) as ScoutArtistRow[]).sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );
    },
    enabled: !!userId && savedIds.length > 0,
  });
}

/** Top artists in the scout's region (or global if no region). */
export function useScoutRegionalTrending(scoutRegionId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.scout.regionalTrending(scoutRegionId ?? null),
    queryFn: async (): Promise<ScoutArtistRow[]> => {
      let q = supabase
        .from("artists")
        .select(`*, region:regions(id, name, country)`)
        .order("listener_count", { ascending: false })
        .limit(24);

      if (scoutRegionId) {
        q = q.eq("region_id", scoutRegionId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ScoutArtistRow[];
    },
  });
}

export function useScoutTrackStatsForArtists(artistIds: string[]) {
  const idsKey = sortedIdsKey(artistIds);

  return useQuery({
    queryKey: queryKeys.scout.trackStatsForArtists(idsKey),
    queryFn: async (): Promise<Map<string, ArtistTrackStats>> => {
      const { data, error } = await supabase
        .from("tracks")
        .select("artist_id, play_count, genre_id, genre:genres(id, name)")
        .in("artist_id", artistIds);

      if (error) throw error;
      return aggregateTrackRows(
        (data ?? []) as {
          artist_id: string;
          play_count: number | null;
          genre_id: string | null;
          genre: { id: string; name: string } | null;
        }[]
      );
    },
    enabled: artistIds.length > 0,
  });
}

export function useScoutArtistTracks(artistId: string | null, open: boolean) {
  return useQuery({
    queryKey: queryKeys.scout.artistTracks(artistId ?? ""),
    queryFn: async () => {
      if (!artistId) return [];

      const { data, error } = await supabase
        .from("tracks")
        .select(
          `id, title, play_count, created_at, genre:genres(id, name)`
        )
        .eq("artist_id", artistId)
        .order("play_count", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!artistId && open,
  });
}

/** Union of saved + trending artist IDs for a single track-stats fetch. */
export function useMergedArtistIdsForStats(savedIds: string[], trending: ScoutArtistRow[] | undefined) {
  return useMemo(() => {
    const set = new Set(savedIds);
    for (const a of trending ?? []) {
      set.add(a.id);
    }
    return [...set];
  }, [savedIds, trending]);
}
