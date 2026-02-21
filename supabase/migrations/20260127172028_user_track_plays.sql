-- Create user_track_plays table for per-user play tracking
-- This enables personalized shuffle algorithms that prioritize less-played songs
CREATE TABLE public.user_track_plays (
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

-- Create index for efficient queries by user and track
CREATE INDEX idx_user_track_plays_user_id ON public.user_track_plays(user_id);
CREATE INDEX idx_user_track_plays_track_id ON public.user_track_plays(track_id);
CREATE INDEX idx_user_track_plays_last_played ON public.user_track_plays(user_id, last_played_timestamp);

-- Enable RLS
ALTER TABLE public.user_track_plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own track plays" ON public.user_track_plays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own track plays" ON public.user_track_plays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own track plays" ON public.user_track_plays
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to increment play count and update timestamps
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

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_track_plays_updated_at
  BEFORE UPDATE ON public.user_track_plays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
