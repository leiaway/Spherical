import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/** Requirement: F7 (add friend feature). See docs/REQUIREMENTS_REFERENCE.md */

/** Friendship row plus optional profile for the other user (friend_profile or user_profile depending on direction). */
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

/**
 * Friends and friend-request state. Loads friendships where current user is either user_id or friend_id,
 * enriches with profiles, and separates accepted vs pending (pending = requests where I am friend_id).
 *
 * **Side effects:** Subscribes to Supabase Realtime on `friendships` table (refetches on change).
 * sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend show toasts.
 *
 * @returns Object with:
 *   - `friends` (Friend[]) - accepted friendships with friend_profile or user_profile set
 *   - `pendingRequests` (Friend[]) - pending requests where current user is friend_id (receiver)
 *   - `loading` (boolean) - true while initial fetch or refetch
 *   - `currentUserId` (string | null)
 *   - `sendFriendRequest` (friendId: string) => Promise<boolean>
 *   - `acceptFriendRequest` (friendshipId: string) => Promise<boolean>
 *   - `rejectFriendRequest` (friendshipId: string) => Promise<boolean>
 *   - `removeFriend` (friendshipId: string) => Promise<boolean>
 *   - `refetch` () => Promise<void>
 *
 * @example
 * const { friends, pendingRequests, acceptFriendRequest, sendFriendRequest } = useFriends();
 * pendingRequests.map(r => (
 *   <Button key={r.id} onClick={() => acceptFriendRequest(r.id)}>Accept</Button>
 * ));
 */
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

    // Other user in each row: if I'm user_id then other is friend_id, else user_id
    const otherUserIds = data?.map(f =>
      f.user_id === currentUserId ? f.friend_id : f.user_id
    ) || [];

    // Fetch profiles for those users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', otherUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Attach the other user's profile: friend_profile when I'm the sender (user_id), user_profile when I'm the receiver (friend_id)
    const enrichedFriendships = data?.map(f => {
      const otherUserId = f.user_id === currentUserId ? f.friend_id : f.user_id;
      const profile = profileMap.get(otherUserId);
      return {
        ...f,
        friend_profile: f.user_id === currentUserId ? profile : undefined,
        user_profile: f.friend_id === currentUserId ? profile : undefined,
      };
    }) || [];

    // Pending = requests sent to me (I am friend_id); accepted = both directions
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
