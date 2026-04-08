import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { ScoutArtistRow } from "@/lib/scoutArtistFilters";
import type { ArtistTrackStats } from "@/lib/scoutArtistFilters";
import { ScoutArtistCard } from "./ScoutArtistCard";

type RegionalTrendingCarouselProps = {
  artists: ScoutArtistRow[];
  statsByArtist: Map<string, ArtistTrackStats>;
  scoutRegionId: string | null | undefined;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onAnalytics: (artist: ScoutArtistRow) => void;
};

export function RegionalTrendingCarousel({
  artists,
  statsByArtist,
  scoutRegionId,
  savedIds,
  onToggleSave,
  onAnalytics,
}: RegionalTrendingCarouselProps) {
  return (
    <section className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm text-foreground">Regional trending</h2>
          {scoutRegionId ? (
            <Badge variant="outline" className="text-[10px] font-normal">
              Your region
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-normal">
              Global ranking
            </Badge>
          )}
        </div>
      </div>

      {artists.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 px-4">
          No artists match your filters, or there is no data for this region yet.
        </p>
      ) : (
        <div className="relative px-10 py-6">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-3">
              {artists.map((artist) => (
                <CarouselItem
                  key={artist.id}
                  className="pl-2 md:pl-3 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <ScoutArtistCard
                    variant="carousel"
                    artist={artist}
                    stats={statsByArtist.get(artist.id)}
                    saved={savedIds.has(artist.id)}
                    onToggleSave={() => onToggleSave(artist.id)}
                    onAnalytics={() => onAnalytics(artist)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-1" />
            <CarouselNext className="right-1" />
          </Carousel>
        </div>
      )}
    </section>
  );
}
