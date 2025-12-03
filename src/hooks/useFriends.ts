import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  user_profile?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchFriends = async () => {
    if (!currentUserId) return;

    setLoading(true);
    
    // Fetch friendships where user is either sender or receiver
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    if (error) {
      console.error('Error fetching friends:', error);
      setLoading(false);
      return;
    }

    // Get all unique user IDs that are not the current user
    const otherUserIds = data?.map(f => 
      f.user_id === currentUserId ? f.friend_id : f.user_id
    ) || [];

    // Fetch profiles for those users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', otherUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Enrich friendships with profile data
    const enrichedFriendships = data?.map(f => {
      const otherUserId = f.user_id === currentUserId ? f.friend_id : f.user_id;
      const profile = profileMap.get(otherUserId);
      return {
        ...f,
        friend_profile: f.user_id === currentUserId ? profile : undefined,
        user_profile: f.friend_id === currentUserId ? profile : undefined,
      };
    }) || [];

    // Separate accepted friends and pending requests
    const accepted = enrichedFriendships.filter(f => f.status === 'accepted');
    const pending = enrichedFriendships.filter(
      f => f.status === 'pending' && f.friend_id === currentUserId
    );

    setFriends(accepted);
    setPendingRequests(pending);
    setLoading(false);
  };

  useEffect(() => {
    if (currentUserId) {
      fetchFriends();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('friendships-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'friendships' },
          () => fetchFriends()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId) {
      toast({ title: 'Please sign in to add friends', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: currentUserId, friend_id: friendId });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Friend request already sent', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to send request', variant: 'destructive' });
      }
      return false;
    }

    toast({ title: 'Friend request sent!' });
    return true;
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) {
      toast({ title: 'Failed to accept request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Friend request accepted!' });
    return true;
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast({ title: 'Failed to reject request', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Request declined' });
    return true;
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) {
      toast({ title: 'Failed to remove friend', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Friend removed' });
    return true;
  };

  return {
    friends,
    pendingRequests,
    loading,
    currentUserId,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch: fetchFriends,
  };
};
