
-- Add youtube_url and mood columns to tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS mood text;

-- Allow authenticated users to insert tracks
CREATE POLICY "Authenticated users can insert tracks"
ON public.tracks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert artists
CREATE POLICY "Authenticated users can insert artists"
ON public.artists
FOR INSERT
TO authenticated
WITH CHECK (true);
