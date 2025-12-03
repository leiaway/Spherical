import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  region_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  region?: {
    id: string;
    name: string;
    country: string;
  } | null;
  track_count?: number;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
  track?: {
    id: string;
    title: string;
    artist: { id: string; name: string; is_emerging: boolean | null } | null;
    genre: { id: string; name: string } | null;
    play_count: number | null;
    cultural_context: string | null;
  };
}

export interface PlaylistShare {
  id: string;
  playlist_id: string;
  shared_with_user_id: string;
  shared_at: string;
  shared_with_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const usePlaylists = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's playlists
  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['playlists', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          region:regions(id, name, country)
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get track counts
      const playlistIds = data?.map(p => p.id) || [];
      if (playlistIds.length > 0) {
        const { data: trackCounts } = await supabase
          .from('playlist_tracks')
          .select('playlist_id')
          .in('playlist_id', playlistIds);

        const countMap = new Map<string, number>();
        trackCounts?.forEach(t => {
          countMap.set(t.playlist_id, (countMap.get(t.playlist_id) || 0) + 1);
        });

        return data?.map(p => ({
          ...p,
          track_count: countMap.get(p.id) || 0
        })) as Playlist[];
      }

      return data as Playlist[];
    },
    enabled: !!currentUserId,
  });

  // Fetch shared playlists
  const { data: sharedPlaylists, isLoading: sharedLoading } = useQuery({
    queryKey: ['shared-playlists', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      const { data: shares, error: sharesError } = await supabase
        .from('playlist_shares')
        .select('playlist_id')
        .eq('shared_with_user_id', currentUserId);

      if (sharesError) throw sharesError;
      if (!shares || shares.length === 0) return [];

      const playlistIds = shares.map(s => s.playlist_id);
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          region:regions(id, name, country)
        `)
        .in('id', playlistIds);

      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!currentUserId,
  });

  // Create playlist mutation
  const createPlaylist = useMutation({
    mutationFn: async ({ name, description, regionId, isPublic }: { 
      name: string; 
      description?: string; 
      regionId?: string;
      isPublic?: boolean;
    }) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: currentUserId,
          name,
          description: description || null,
          region_id: regionId || null,
          is_public: isPublic || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({ title: 'Playlist created!' });
    },
    onError: () => {
      toast({ title: 'Failed to create playlist', variant: 'destructive' });
    },
  });

  // Add track to playlist mutation
  const addTrackToPlaylist = useMutation({
    mutationFn: async ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
      const { data: existing } = await supabase
        .from('playlist_tracks')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId)
        .maybeSingle();

      if (existing) throw new Error('Track already in playlist');

      const { data: lastTrack } = await supabase
        .from('playlist_tracks')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newPosition = (lastTrack?.position ?? -1) + 1;

      const { error } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
          position: newPosition,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks'] });
      toast({ title: 'Track added to playlist!' });
    },
    onError: (error: Error) => {
      if (error.message === 'Track already in playlist') {
        toast({ title: 'Track already in playlist', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add track', variant: 'destructive' });
      }
    },
  });

  // Remove track from playlist mutation
  const removeTrackFromPlaylist = useMutation({
    mutationFn: async ({ playlistId, trackId }: { playlistId: string; trackId: string }) => {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks'] });
      toast({ title: 'Track removed' });
    },
    onError: () => {
      toast({ title: 'Failed to remove track', variant: 'destructive' });
    },
  });

  // Share playlist mutation
  const sharePlaylist = useMutation({
    mutationFn: async ({ playlistId, userId }: { playlistId: string; userId: string }) => {
      const { error } = await supabase
        .from('playlist_shares')
        .insert({
          playlist_id: playlistId,
          shared_with_user_id: userId,
        });

      if (error) {
        if (error.code === '23505') throw new Error('Already shared with this user');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-shares'] });
      toast({ title: 'Playlist shared!' });
    },
    onError: (error: Error) => {
      if (error.message === 'Already shared with this user') {
        toast({ title: 'Already shared with this user', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to share playlist', variant: 'destructive' });
      }
    },
  });

  // Delete playlist mutation
  const deletePlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({ title: 'Playlist deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete playlist', variant: 'destructive' });
    },
  });

  return {
    playlists: playlists || [],
    sharedPlaylists: sharedPlaylists || [],
    isLoading: playlistsLoading || sharedLoading,
    currentUserId,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    sharePlaylist,
    deletePlaylist,
  };
};

// Hook to fetch tracks for a specific playlist
export const usePlaylistTracks = (playlistId: string | null) => {
  return useQuery({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: async () => {
      if (!playlistId) return [];

      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          *,
          track:tracks(
            id,
            title,
            play_count,
            cultural_context,
            artist:artists(id, name, is_emerging),
            genre:genres(id, name)
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position');

      if (error) throw error;
      return data as PlaylistTrack[];
    },
    enabled: !!playlistId,
  });
};

// Hook to fetch shares for a specific playlist
export const usePlaylistShares = (playlistId: string | null) => {
  return useQuery({
    queryKey: ['playlist-shares', playlistId],
    queryFn: async () => {
      if (!playlistId) return [];

      const { data, error } = await supabase
        .from('playlist_shares')
        .select('*')
        .eq('playlist_id', playlistId);

      if (error) throw error;

      // Fetch profiles for shared users
      const userIds = data?.map(s => s.shared_with_user_id) || [];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        return data?.map(s => ({
          ...s,
          shared_with_profile: profileMap.get(s.shared_with_user_id),
        })) as PlaylistShare[];
      }

      return data as PlaylistShare[];
    },
    enabled: !!playlistId,
  });
};
