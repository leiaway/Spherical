import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/** Requirement: F7 (add friend feature). See docs/REQUIREMENTS_REFERENCE.md */

/** Postgres error code for a unique-constraint violation (duplicate friendship row). */
const POSTGRES_UNIQUE_VIOLATION = '23505';

/** Minimal shape of a Supabase PostgREST error used by friendship mutations. */
interface SupabaseError {
  code?: string;
  message?: string;
}

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
    console.error('[useFriends] Error fetching friendships:', error);
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
    console.error('[useFriends] Error fetching friend profiles:', profilesError);
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
        console.error('[useFriends] Error fetching current user:', error);
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

  /**
   * Runs a Supabase mutation, shows a toast on success or failure, and returns whether it succeeded.
   *
   * @param operation - async function that performs the DB write and returns `{ error }`
   * @param successMessage - toast title shown on success
   * @param getErrorMessage - maps the Supabase error to a user-facing string; each caller supplies
   *   its own resolver so that the same Postgres error code can mean different things per operation
   *   (e.g. 23505 is "already sent" only for sendFriendRequest, not for update/delete paths)
   */
  const runMutation = async (
    operation: () => Promise<{ error: SupabaseError | null }>,
    successMessage: string,
    getErrorMessage: (error: SupabaseError) => string,
  ): Promise<boolean> => {
    const { error } = await operation();

    if (error) {
      toast({ title: getErrorMessage(error), variant: 'destructive' });
      return false;
    }

    toast({ title: successMessage });
    return true;
  };

  const sendFriendRequest = async (friendId: string): Promise<boolean> => {
    if (!currentUserId) {
      toast({ title: 'Please sign in to add friends', variant: 'destructive' });
      return false;
    }

    return runMutation(
      () => supabase.from('friendships').insert({ user_id: currentUserId, friend_id: friendId }),
      'Friend request sent!',
      (error) =>
        error.code === POSTGRES_UNIQUE_VIOLATION
          ? 'Friend request already sent'
          : 'Failed to send request',
    );
  };

  const acceptFriendRequest = (friendshipId: string): Promise<boolean> =>
    runMutation(
      () => supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId),
      'Friend request accepted!',
      () => 'Failed to accept request',
    );

  const rejectFriendRequest = (friendshipId: string): Promise<boolean> =>
    runMutation(
      () => supabase.from('friendships').delete().eq('id', friendshipId),
      'Request declined',
      () => 'Failed to reject request',
    );

  const removeFriend = (friendshipId: string): Promise<boolean> =>
    runMutation(
      () => supabase.from('friendships').delete().eq('id', friendshipId),
      'Friend removed',
      () => 'Failed to remove friend',
    );

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
