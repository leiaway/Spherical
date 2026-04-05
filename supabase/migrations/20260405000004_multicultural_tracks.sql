-- F2.3: Multi-cultural music recommendations
-- Returns tracks from regions OTHER than the user's current region,
-- ordered by play_count descending for quality, enabling cross-cultural discovery.
CREATE OR REPLACE FUNCTION get_multicultural_tracks(
  p_exclude_region_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  play_count INT,
  cultural_context TEXT,
  audio_url TEXT,
  cover_image_url TEXT,
  duration_seconds INT,
  artist_id UUID,
  artist_name TEXT,
  artist_is_emerging BOOLEAN,
  genre_id UUID,
  genre_name TEXT
)
LANGUAGE sql STABLE AS $$
  SELECT
    t.id,
    t.title,
    t.play_count,
    t.cultural_context,
    t.audio_url,
    t.cover_image_url,
    t.duration_seconds,
    a.id   AS artist_id,
    a.name AS artist_name,
    a.is_emerging AS artist_is_emerging,
    g.id   AS genre_id,
    g.name AS genre_name
  FROM tracks t
  LEFT JOIN artists a ON t.artist_id = a.id
  LEFT JOIN genres  g ON t.genre_id  = g.id
  WHERE t.region_id != p_exclude_region_id
    AND t.play_count IS NOT NULL
  ORDER BY t.play_count DESC
  LIMIT p_limit;
$$;
