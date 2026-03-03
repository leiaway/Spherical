-- Enable RLS on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- PUBLIC TABLES (anyone can read, no writes from client)
-- Regions: Public read-only
CREATE POLICY "Regions are public" ON regions
  FOR SELECT USING (true);

-- Artists: Public read-only
CREATE POLICY "Artists are public" ON artists
  FOR SELECT USING (true);

-- Tracks: Public read-only
CREATE POLICY "Tracks are public" ON tracks
  FOR SELECT USING (true);

-- Genres: Public read-only
CREATE POLICY "Genres are public" ON genres
  FOR SELECT USING (true);

-- USER-SPECIFIC TABLES
-- Profiles: Users can read their own profile and all other profiles (for social features)
-- but can only update their own
CREATE POLICY "Users can read all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Playlists: Users can read all public playlists and their own private ones
CREATE POLICY "Users can read public playlists" ON playlists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- Playlist Tracks: Users can read tracks in playlists they have access to
CREATE POLICY "Users can read playlist tracks" ON playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add tracks to their playlists" ON playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from their playlists" ON playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Playlist Shares: Users can read shares for playlists they have access to
CREATE POLICY "Users can read playlist shares" ON playlist_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_shares.playlist_id
      AND (playlists.is_public = true OR playlists.user_id = auth.uid() OR playlist_shares.shared_with_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can share their playlists" ON playlist_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_shares.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Friendships: Users can manage their own friendships
CREATE POLICY "Users can read friendships involving them" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id);
