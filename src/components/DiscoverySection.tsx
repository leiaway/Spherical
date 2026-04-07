import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackCard } from "./TrackCard";
import { ArtistCard } from "./ArtistCard";
import { useRegionArtists, type Region } from "@/hooks/useRegions";
import { usePersonalizedRegionTracks } from "@/hooks/usePersonalizedRegionTracks";
import { useRegionTracks } from "@/hooks/useRegions";
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/lib/calculateDistance";
import { Music, Users, MapPin, Sparkles, RefreshCw, CalendarDays } from "lucide-react";
import { MoodPlaylistPanel } from "./MoodPlaylistPanel";

/** Requirement: F1 (geo-tracking local mix), F5 (cultural recommendations by region), F8 (emerging artists tab). See docs/REQUIREMENTS_REFERENCE.md */

interface DiscoverySectionProps {
  region: Region;
  isLocationBased?: boolean;
  distance?: number;
  homeRegion?: Region | null;
  userId?: string | null;
}

/**
 * Main discovery panel for a region: header (name, country, "Near You" / distance), description,
 * and tabs for Popular Tracks, Local Artists, and Emerging artists. Uses useRegionTracks and useRegionArtists.
 */
export const DiscoverySection = ({
  region,
  isLocationBased = false,
  distance,
  homeRegion,
  userId,
}: DiscoverySectionProps) => {
  const [activeTab, setActiveTab] = useState("tracks");
  const queryClient = useQueryClient();
  const { data: tracks, isLoading: tracksLoading } = usePersonalizedRegionTracks(region.id, userId ?? null);
  const { data: artists, isLoading: artistsLoading } = useRegionArtists(region.id);

  const handleTrackPlay = useCallback(async (trackId: string) => {
    if (!userId) return;
    await supabase.rpc('increment_user_track_play', {
      p_user_id: userId,
      p_track_id: trackId,
    });
    queryClient.invalidateQueries({ queryKey: ['personalized-region-tracks'] });
  }, [userId, queryClient]);

  // F1.2 — Fetch home-region content if user has a different home country
  const homeRegionId = homeRegion && homeRegion.id !== region.id ? homeRegion.id : null;
  const { data: homeTracks } = useRegionTracks(homeRegionId);
  const { data: homeArtists } = useRegionArtists(homeRegionId);

  useEffect(() => {
    console.log("🧪 VIBE Test: Starting Manual Audit of calculateDistance...");

    try {
      // 1. Test Valid Input
      const dist = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
      console.log("✅ Valid Calculation (NYC to LA):", dist, "km");

      // 2. Test YOUR Human-Verified Boundary (The V-Event)
      console.log("⚠️ Triggering Human-Verified Boundary (Lat: 105)...");
      calculateDistance(105, -74.006, 34.0522, -118.2437);
    } catch (error) {
      // This proves your "Reject NaN" logic is working!
      console.error(
        "🎯 TEST LOG SUCCESS:",
        error instanceof Error ? error.message : error
      );
    }
  }, []);

  /** Interleave two arrays: [A, B, A, B, ...], appending remaining items from the longer one. */
  function interleave<T>(primary: T[], secondary: T[]): Array<T & { contextTag: "Local" | "Home" }> {
    const tagged = primary.map(item => ({ ...item, contextTag: "Local" as const }));
    const taggedHome = secondary.map(item => ({ ...item, contextTag: "Home" as const }));
    const result: Array<T & { contextTag: "Local" | "Home" }> = [];
    const maxLen = Math.max(tagged.length, taggedHome.length);
    for (let i = 0; i < maxLen; i++) {
      if (tagged[i]) result.push(tagged[i]);
      if (taggedHome[i]) result.push(taggedHome[i]);
    }
    return result;
  }

  const mixedTracks = homeRegionId && homeTracks?.length
    ? interleave(tracks ?? [], homeTracks)
    : (tracks ?? []).map(t => ({ ...t, contextTag: undefined as undefined }));

  const allArtists = homeRegionId && homeArtists?.length
    ? interleave(artists ?? [], homeArtists)
    : (artists ?? []).map(a => ({ ...a, contextTag: undefined as undefined }));

  const emergingArtists = allArtists.filter(a => a.is_emerging);
  const popularArtists = allArtists.filter(a => !a.is_emerging);

  const isMixed = !!homeRegionId;

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
            {isMixed ? "Blended Tracks" : "Popular Tracks"}
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2 data-[state=active]:bg-card">
            <Users className="w-4 h-4" />
            {isMixed ? "All Artists" : "Local Artists"}
          </TabsTrigger>
          {emergingArtists.length > 0 && (
            <TabsTrigger value="emerging" className="gap-2 data-[state=active]:bg-card">
              <Sparkles className="w-4 h-4" />
              Emerging
            </TabsTrigger>
          )}
          <TabsTrigger value="mood" className="gap-2 data-[state=active]:bg-card">
            <CalendarDays className="w-4 h-4" />
            Mood & Festivals
          </TabsTrigger>
        </TabsList>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-4">
          {tracksLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : mixedTracks.length > 0 ? (
            <div className="space-y-3">
              {isMixed && (
                <p className="text-xs text-muted-foreground">
                  Showing a mix of local hits and music from your home region
                </p>
              )}
              {mixedTracks.map((track, index) => (
                <TrackCard key={`${track.id}-${index}`} track={track} index={index} contextTag={track.contextTag} onPlay={handleTrackPlay} />
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
          ) : popularArtists.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {popularArtists.map((artist) => (
                <ArtistCard key={`${artist.id}-${artist.contextTag}`} artist={artist} contextTag={artist.contextTag} />
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
                  <ArtistCard key={`${artist.id}-${artist.contextTag}`} artist={artist} contextTag={artist.contextTag} />
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

        {/* Mood & Festivals Tab */}
        <TabsContent value="mood" className="space-y-4">
          <MoodPlaylistPanel region={region} onPlay={handleTrackPlay} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
