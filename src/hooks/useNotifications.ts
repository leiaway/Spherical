import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/** Requirement: F1.10 (talent scout notifications). See docs/REQUIREMENTS_REFERENCE.md */

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  payload: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Loads the current user's in-app notifications and subscribes to new ones via Realtime.
 * Returns the notification list plus a `markAsRead` helper.
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, payload, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  // Realtime subscription — refetch whenever the notifications table changes for this user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    void queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
  };

  const unreadCount = (query.data ?? []).filter((n) => !n.read).length;

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
