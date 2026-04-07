import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/** Requirement: F1.10 (talent scout — watchlist of emerging artists). */

export interface WatchedArtist {
  watch_id: string;
  artist_id: string;
  artist_name: string;
  artist_image: string | null;
  is_emerging: boolean | null;
  listener_count: number | null;
}

export const useScoutWatchlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery<WatchedArtist[]>({
    queryKey: ['scout-watchlist', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('scout_watches')
        .select('id, artist_id, artists(name, image_url, is_emerging, listener_count)')
        .eq('scout_id', user!.id);
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        watch_id: row.id,
        artist_id: row.artist_id,
        artist_name: row.artists?.name ?? 'Unknown',
        artist_image: row.artists?.image_url ?? null,
        is_emerging: row.artists?.is_emerging ?? null,
        listener_count: row.artists?.listener_count ?? null,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const watchArtist = async (artistId: string) => {
    if (!user) { toast({ title: 'Sign in to watch artists', variant: 'destructive' }); return; }
    const { error } = await (supabase as any)
      .from('scout_watches')
      .insert({ scout_id: user.id, artist_id: artistId });
    if (error && error.code !== '23505') {
      toast({ title: 'Failed to add to watchlist', variant: 'destructive' });
    } else {
      toast({ title: 'Artist added to watchlist' });
      void queryClient.invalidateQueries({ queryKey: ['scout-watchlist', user.id] });
    }
  };

  const unwatchArtist = async (watchId: string) => {
    const { error } = await (supabase as any).from('scout_watches').delete().eq('id', watchId);
    if (error) { toast({ title: 'Failed to remove from watchlist', variant: 'destructive' }); return; }
    toast({ title: 'Removed from watchlist' });
    void queryClient.invalidateQueries({ queryKey: ['scout-watchlist', user?.id] });
  };

  const isWatching = (artistId: string) =>
    (query.data ?? []).some((w) => w.artist_id === artistId);

  return {
    watchlist: query.data ?? [],
    isLoading: query.isLoading,
    watchArtist,
    unwatchArtist,
    isWatching,
  };
};
