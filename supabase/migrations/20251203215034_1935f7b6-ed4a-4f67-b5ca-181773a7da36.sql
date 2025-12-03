-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  region_id UUID REFERENCES public.regions(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_tracks table
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Create playlist_shares table for sharing with friends
CREATE TABLE public.playlist_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_shares ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view shared playlists" ON public.playlists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlist_shares 
      WHERE playlist_id = playlists.id AND shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist tracks policies
CREATE POLICY "Users can view tracks in accessible playlists" ON public.playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_tracks.playlist_id
      AND (p.user_id = auth.uid() OR p.is_public = true OR EXISTS (
        SELECT 1 FROM public.playlist_shares ps 
        WHERE ps.playlist_id = p.id AND ps.shared_with_user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can add tracks to own playlists" ON public.playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can remove tracks from own playlists" ON public.playlist_tracks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

-- Playlist shares policies
CREATE POLICY "Users can view shares for own playlists" ON public.playlist_shares
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
    OR shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can share own playlists" ON public.playlist_shares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can unshare own playlists" ON public.playlist_shares
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

-- Add updated_at trigger
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();