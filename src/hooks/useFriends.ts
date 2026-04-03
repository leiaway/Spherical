import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface FriendsQueryResult {
  friends: Friend[];
  pendingRequests: Friend[];
}

const fetchFriendsForUser = async (currentUserId: string): Promise<FriendsQueryResult> => {
  if (!currentUserId) {
    throw new Error('Cannot fetch friends without a valid user id');
  }

  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

  if (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }

  const friendships = data ?? [];

  if (friendships.length === 0) {
    return { friends: [], pendingRequests: [] };
  }

  const otherUserIds = friendships.map((f) =>
    f.user_id === currentUserId ? f.friend_id : f.user_id,
  );

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', otherUserIds);

  if (profilesError) {
    console.error('Error fetching friend profiles:', profilesError);
    throw profilesError;
  }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

  const enrichedFriendships: Friend[] = friendships.map((f) => {
    const otherUserId = f.user_id === currentUserId ? f.friend_id : f.user_id;
    const profile = profileMap.get(otherUserId);

    return {
      ...f,
      friend_profile: f.user_id === currentUserId ? profile : undefined,
      user_profile: f.friend_id === currentUserId ? profile : undefined,
    };
  });

  const accepted = enrichedFriendships.filter((f) => f.status === 'accepted');
  const pending = enrichedFriendships.filter(
    (f) => f.status === 'pending' && f.friend_id === currentUserId,
  );

  return {
    friends: accepted,
    pendingRequests: pending,
  };
};

/**
 * Friends and friend-request state. Loads friendships where current user is either user_id or friend_id,
 * enriches with profiles, and separates accepted vs pending (pending = requests where I am friend_id).
 *
 * Side effects:
 * - Subscribes to Supabase Realtime on `friendships` table (refetches on change).
 * - sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend show toasts.
 */
export const useFriends = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching current user:', error);
        setCurrentUserId(null);
        return;
      }

      setCurrentUserId(data.user?.id ?? null);
    };

    void getUser();
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<FriendsQueryResult, Error>({
    queryKey: ['friends', currentUserId],
    queryFn: () => fetchFriendsForUser(currentUserId as string),
    enabled: !!currentUserId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Unable to load friends',
        description: error.message ?? 'Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refetch]);

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
    friends: data?.friends ?? [],
    pendingRequests: data?.pendingRequests ?? [],
    loading: isLoading,
    currentUserId,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch,
    isError,
    error,
  };
};
