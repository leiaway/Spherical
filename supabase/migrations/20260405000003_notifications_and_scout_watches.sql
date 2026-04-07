-- Requirement: F1.10 (talent scout — notify when watched artists gain regional traction)

-- Notifications table: in-app messages delivered to a user
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,           -- e.g. 'artist_trending', 'friend_request', 'new_track'
  title       TEXT NOT NULL,
  body        TEXT,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  payload     JSONB,                   -- arbitrary extra data (artist_id, region_id, etc.)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id, created_at DESC);

-- Scout watches: a user (talent scout) watches an artist for updates
CREATE TABLE IF NOT EXISTS public.scout_watches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id   UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scout_id, artist_id)
);

CREATE INDEX IF NOT EXISTS scout_watches_scout_idx ON public.scout_watches (scout_id);

-- RLS for notifications: users can only read/update their own rows
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert notifications (backend triggers / edge functions)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- RLS for scout_watches: users manage their own watchlist
ALTER TABLE public.scout_watches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scouts can read own watches"
  ON public.scout_watches FOR SELECT
  USING (auth.uid() = scout_id);

CREATE POLICY "Scouts can add watches"
  ON public.scout_watches FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

CREATE POLICY "Scouts can remove watches"
  ON public.scout_watches FOR DELETE
  USING (auth.uid() = scout_id);
