-- Requirement: F1.3 (encourage users to connect with others sharing their musical background)
-- Returns up to 10 suggested friend profiles scored by genre overlap.
-- Falls back to home_country matching when the user has no listening history.

CREATE OR REPLACE FUNCTION public.get_suggested_friends(
  p_user_id UUID
)
RETURNS TABLE (
  profile_id   UUID,
  display_name TEXT,
  avatar_url   TEXT,
  taste_score  INTEGER,
  match_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Primary: match by shared genre listening history
  RETURN QUERY
  WITH my_genres AS (
    -- The requesting user's top 5 genres by personal play count
    SELECT t.genre_id
    FROM   public.user_track_plays utp
    JOIN   public.tracks t ON t.id = utp.track_id
    WHERE  utp.user_id = p_user_id
      AND  t.genre_id IS NOT NULL
    GROUP BY t.genre_id
    ORDER BY SUM(utp.play_count) DESC
    LIMIT 5
  ),
  candidate_scores AS (
    -- Other users who have listened to tracks in those same genres
    SELECT
      utp.user_id                         AS candidate_id,
      COUNT(DISTINCT t.genre_id)::INTEGER AS score
    FROM   public.user_track_plays utp
    JOIN   public.tracks t ON t.id = utp.track_id
    WHERE  t.genre_id IN (SELECT genre_id FROM my_genres)
      AND  utp.user_id <> p_user_id
      -- Exclude existing friends and pending requests in both directions
      AND  utp.user_id NOT IN (
             SELECT friend_id FROM public.friendships
             WHERE user_id = p_user_id
               AND status IN ('accepted', 'pending')
             UNION
             SELECT user_id FROM public.friendships
             WHERE friend_id = p_user_id
               AND status IN ('accepted', 'pending')
           )
    GROUP BY utp.user_id
    HAVING COUNT(DISTINCT t.genre_id) > 0
  )
  SELECT
    p.id,
    p.display_name,
    p.avatar_url,
    cs.score,
    'genre_overlap'::TEXT
  FROM   candidate_scores cs
  JOIN   public.profiles p ON p.id = cs.candidate_id
  ORDER  BY cs.score DESC
  LIMIT 10;

  -- If no rows were returned, fall back to home_country matching
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      p.id,
      p.display_name,
      p.avatar_url,
      1::INTEGER,
      'home_country'::TEXT
    FROM public.profiles p
    WHERE p.home_country IS NOT NULL
      AND p.home_country = (
            SELECT home_country FROM public.profiles WHERE id = p_user_id
          )
      AND p.id <> p_user_id
      AND p.id NOT IN (
            SELECT friend_id FROM public.friendships
            WHERE user_id = p_user_id
              AND status IN ('accepted', 'pending')
            UNION
            SELECT user_id FROM public.friendships
            WHERE friend_id = p_user_id
              AND status IN ('accepted', 'pending')
          )
    LIMIT 10;
  END IF;
END;
$$;
