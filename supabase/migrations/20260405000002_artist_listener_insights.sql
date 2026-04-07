-- Requirement: F1.7 (artist promotion insights — which regions listeners come from)
-- Returns a ranked list of regions where a given artist's tracks have been played,
-- ordered by total play count descending.

CREATE OR REPLACE FUNCTION public.get_artist_listener_regions(p_artist_id UUID)
RETURNS TABLE (
  region_id   UUID,
  region_name TEXT,
  play_count  BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    r.id          AS region_id,
    r.name        AS region_name,
    COUNT(*)::BIGINT AS play_count
  FROM public.user_track_plays utp
  JOIN public.tracks            t  ON t.id = utp.track_id
  JOIN public.regions           r  ON r.id = t.region_id
  WHERE t.artist_id = p_artist_id
  GROUP BY r.id, r.name
  ORDER BY play_count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_artist_listener_regions(UUID) TO authenticated;
