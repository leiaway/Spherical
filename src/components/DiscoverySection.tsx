import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackCard } from "./TrackCard";
import { ArtistCard } from "./ArtistCard";
import { useRegionTracks, useRegionArtists, type Region } from "@/hooks/useRegions";
import { Music, Users, MapPin, Sparkles, RefreshCw } from "lucide-react";

interface DiscoverySectionProps {
  region: Region;
  isLocationBased?: boolean;
  distance?: number;
}

export const DiscoverySection = ({ 
  region, 
  isLocationBased = false,
  distance 
}: DiscoverySectionProps) => {
  const [activeTab, setActiveTab] = useState("tracks");
  const { data: tracks, isLoading: tracksLoading } = useRegionTracks(region.id);
  const { data: artists, isLoading: artistsLoading } = useRegionArtists(region.id);

  const emergingArtists = artists?.filter(a => a.is_emerging) || [];
  const popularArtists = artists?.filter(a => !a.is_emerging) || [];

  return (
    <section className="space-y-6">
      {/* Region Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isLocationBased && (
              <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary">
                <MapPin className="w-3 h-3" />
                Near You
              </Badge>
            )}
            {distance && (
              <Badge variant="outline" className="text-muted-foreground">
                ~{distance.toLocaleString()} km away
              </Badge>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {region.name}
          </h2>
          <p className="text-lg text-muted-foreground">{region.country}</p>
        </div>
      </div>

      {region.description && (
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          {region.description}
        </p>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="tracks" className="gap-2 data-[state=active]:bg-card">
            <Music className="w-4 h-4" />
            Popular Tracks
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2 data-[state=active]:bg-card">
            <Users className="w-4 h-4" />
            Local Artists
          </TabsTrigger>
          {emergingArtists.length > 0 && (
            <TabsTrigger value="emerging" className="gap-2 data-[state=active]:bg-card">
              <Sparkles className="w-4 h-4" />
              Emerging
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-4">
          {tracksLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : tracks && tracks.length > 0 ? (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tracks found for this region yet</p>
            </div>
          )}
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-4">
          {artistsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : popularArtists && popularArtists.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {popularArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No artists found for this region yet</p>
            </div>
          )}
        </TabsContent>

        {/* Emerging Artists Tab */}
        <TabsContent value="emerging" className="space-y-4">
          {artistsLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : emergingArtists.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Discover rising talent from {region.name} before they go mainstream
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {emergingArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emerging artists found for this region yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};
