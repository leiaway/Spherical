-- Requirement: F1.5 (regionally relevant, personalized music suggestions)
-- Returns tracks for a region ordered by what the user has heard least,
-- falling back to global play_count as a tiebreaker.
-- Unheard tracks (no row in user_track_plays) appear first.

CREATE OR REPLACE FUNCTION public.get_personalized_region_tracks(
  p_user_id UUID,
  p_region_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  play_count INTEGER,
  cultural_context TEXT,
  audio_url TEXT,
  cover_image_url TEXT,
  duration_seconds INTEGER,
  artist_id UUID,
  artist_name TEXT,
  artist_is_emerging BOOLEAN,
  genre_id UUID,
  genre_name TEXT
)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    t.id,
    t.title,
    t.play_count,
    t.cultural_context,
    t.audio_url,
    t.cover_image_url,
    t.duration_seconds,
    a.id            AS artist_id,
    a.name          AS artist_name,
    a.is_emerging   AS artist_is_emerging,
    g.id            AS genre_id,
    g.name          AS genre_name
  FROM public.tracks t
  LEFT JOIN public.artists a  ON a.id = t.artist_id
  LEFT JOIN public.genres  g  ON g.id = t.genre_id
  LEFT JOIN public.user_track_plays utp
         ON utp.track_id = t.id
        AND utp.user_id  = p_user_id
  WHERE t.region_id = p_region_id
  ORDER BY
    COALESCE(utp.play_count, 0) ASC,   -- unheard tracks first
    t.play_count DESC NULLS LAST;       -- then globally popular
$$;
