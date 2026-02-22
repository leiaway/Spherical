import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArtistCard } from '@/components/ArtistCard';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergingArtistsRecommendationsProps {
  regionId?: string | null;
}

/**
 * Sidebar recommendations: up to 4 emerging artists. When regionId is set, prefers artists from *other* regions
 * to encourage discovery beyond the current region; then shuffles and takes 4 for variety.
 */
export const EmergingArtistsRecommendations = ({ regionId }: EmergingArtistsRecommendationsProps) => {
  const { data: artists, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['emerging-artists-recommendations', regionId],
    queryFn: async () => {
      let query = supabase
        .from('artists')
        .select(`
          *,
          regions (name, country)
        `)
        .eq('is_emerging', true)
        .order('listener_count', { ascending: true }) // Prioritize least-played (rising talent)
        .limit(6);

      // Prefer emerging artists from other regions when one is selected (cross-region discovery)
      if (regionId) {
        query = query.neq('region_id', regionId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Shuffle then take 4 for variety between loads
      return data?.sort(() => Math.random() - 0.5).slice(0, 4) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-medium text-sm text-foreground">Discover Emerging Artists</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-4">
          Hidden gems waiting to be discovered — artists breaking through with fresh sounds
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {artists.map((artist) => {
            const regionData = artist.regions as { name: string; country: string } | null;
            return (
              <ArtistCard
                key={artist.id}
                artist={{
                  id: artist.id,
                  name: artist.name,
                  bio: artist.bio,
                  is_emerging: artist.is_emerging,
                  listener_count: artist.listener_count,
                  image_url: artist.image_url,
                  region: regionData ? {
                    name: regionData.name,
                    country: regionData.country,
                  } : undefined,
                }}
                compact
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
