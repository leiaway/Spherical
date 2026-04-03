-- Requirement: F1.6 (playlists reflecting local mood or festivals for emotional connection to location)

-- 1. Add mood column to tracks
ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS mood TEXT
  CHECK (mood IN ('energetic','chill','melancholic','festive','spiritual','romantic','protest'));

-- 2. Create festivals table
CREATE TABLE IF NOT EXISTS public.festivals (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT        NOT NULL,
  region_id      UUID        NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  description    TEXT,
  typical_month  INTEGER     CHECK (typical_month BETWEEN 1 AND 12),
  mood           TEXT        CHECK (mood IN ('energetic','chill','melancholic','festive','spiritual','romantic','protest')),
  genre_id       UUID        REFERENCES public.genres(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_festivals_region_id     ON public.festivals(region_id);
CREATE INDEX IF NOT EXISTS idx_festivals_typical_month ON public.festivals(typical_month);

ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Festivals are publicly readable"
  ON public.festivals FOR SELECT USING (true);

-- 3. Extend playlists with type, mood, and festival link
ALTER TABLE public.playlists
  ADD COLUMN IF NOT EXISTS playlist_type TEXT DEFAULT 'user'
    CHECK (playlist_type IN ('user','mood','festival','system'));

ALTER TABLE public.playlists
  ADD COLUMN IF NOT EXISTS mood TEXT;

ALTER TABLE public.playlists
  ADD COLUMN IF NOT EXISTS festival_id UUID REFERENCES public.festivals(id);

-- 4. Function: generate a mood playlist for a region
-- Returns up to p_limit track IDs matching the region + mood, ordered by play_count.
CREATE OR REPLACE FUNCTION public.generate_mood_playlist(
  p_region_id UUID,
  p_mood      TEXT,
  p_limit     INTEGER DEFAULT 20
)
RETURNS TABLE (track_id UUID)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT id
  FROM   public.tracks
  WHERE  region_id = p_region_id
    AND  mood      = p_mood
  ORDER  BY play_count DESC NULLS LAST
  LIMIT  p_limit;
$$;

-- 5. Function: generate a festival playlist
-- Matches tracks by the festival's region + mood + genre, relaxing constraints progressively.
CREATE OR REPLACE FUNCTION public.generate_festival_playlist(
  p_festival_id UUID,
  p_limit       INTEGER DEFAULT 20
)
RETURNS TABLE (track_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_region_id UUID;
  v_mood      TEXT;
  v_genre_id  UUID;
BEGIN
  SELECT region_id, mood, genre_id
    INTO v_region_id, v_mood, v_genre_id
    FROM public.festivals
   WHERE id = p_festival_id;

  -- Try tightest match first: region + genre + mood
  RETURN QUERY
    SELECT id FROM public.tracks
    WHERE  region_id = v_region_id
      AND  (v_genre_id IS NULL OR genre_id = v_genre_id)
      AND  (v_mood     IS NULL OR mood     = v_mood)
    ORDER BY play_count DESC NULLS LAST
    LIMIT p_limit;

  -- If not enough results, relax genre constraint
  IF (SELECT COUNT(*) FROM (
        SELECT id FROM public.tracks
        WHERE  region_id = v_region_id
          AND  (v_genre_id IS NULL OR genre_id = v_genre_id)
          AND  (v_mood     IS NULL OR mood     = v_mood)
        LIMIT p_limit
      ) sub) < p_limit THEN
    RETURN QUERY
      SELECT id FROM public.tracks
      WHERE  region_id = v_region_id
        AND  (v_mood IS NULL OR mood = v_mood)
        AND  id NOT IN (
               SELECT t2.id FROM public.tracks t2
               WHERE  t2.region_id = v_region_id
                 AND  (v_genre_id IS NULL OR t2.genre_id = v_genre_id)
                 AND  (v_mood     IS NULL OR t2.mood     = v_mood)
             )
      ORDER BY play_count DESC NULLS LAST
      LIMIT p_limit;
  END IF;
END;
$$;
