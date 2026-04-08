import { useCallback, useEffect, useState } from "react";
import {
  loadSavedArtistIds,
  persistSavedArtistIds,
} from "@/lib/scoutSavedArtistsStorage";

export function useScoutSavedArtistIds(userId: string | null) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setSavedIds([]);
      return;
    }
    setSavedIds(loadSavedArtistIds(userId));
  }, [userId]);

  const toggleSaved = useCallback(
    (artistId: string) => {
      if (!userId) return;
      setSavedIds((prev) => {
        const next = prev.includes(artistId)
          ? prev.filter((id) => id !== artistId)
          : [...prev, artistId];
        persistSavedArtistIds(userId, next);
        return next;
      });
    },
    [userId]
  );

  const isSaved = useCallback(
    (artistId: string) => savedIds.includes(artistId),
    [savedIds]
  );

  return { savedIds, toggleSaved, isSaved };
}
