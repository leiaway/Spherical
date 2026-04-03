-- Migration: Add user_track_plays table and increment function for shuffle algorithm
-- See docs/F6.1-shuffle-algorithm-design.md

CREATE TABLE IF NOT EXISTS public.user_track_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  play_count INTEGER NOT NULL DEFAULT 0,
  last_played_timestamp TIMESTAMP WITH TIME ZONE,
  first_played_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_user_track_plays_user_id ON public.user_track_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_plays_track_id ON public.user_track_plays(track_id);
CREATE INDEX IF NOT EXISTS idx_user_track_plays_last_played ON public.user_track_plays(user_id, last_played_timestamp);

ALTER TABLE public.user_track_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own track plays" ON public.user_track_plays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own track plays" ON public.user_track_plays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own track plays" ON public.user_track_plays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_user_track_play(
  p_user_id UUID,
  p_track_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_track_plays (user_id, track_id, play_count, last_played_timestamp, first_played_timestamp)
  VALUES (p_user_id, p_track_id, 1, now(), now())
  ON CONFLICT (user_id, track_id)
  DO UPDATE SET
    play_count = user_track_plays.play_count + 1,
    last_played_timestamp = now(),
    updated_at = now();
END;
$$;

-- Trigger to update updated_at timestamp (assumes update_updated_at_column exists)
CREATE TRIGGER IF NOT EXISTS update_user_track_plays_updated_at
  BEFORE UPDATE ON public.user_track_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
