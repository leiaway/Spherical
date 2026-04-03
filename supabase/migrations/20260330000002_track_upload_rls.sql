-- Requirement: F1.4 (user song tagging with location and genre for local discovery)
-- Allow authenticated users to insert tracks and artists so they can tag
-- their music with region and genre to be discovered locally.

CREATE POLICY "Authenticated users can upload tracks"
ON public.tracks FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create artists"
ON public.artists FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
