import { useRef } from "react";
import { ChevronLeft, ChevronRight, Music, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegionTracks, type Region } from "@/hooks/useRegions";
import { useAudio } from "@/contexts/AudioContext";

interface RegionCardProps {
  region: Region;
  onClick: () => void;
}

const RegionCard = ({ region, onClick }: RegionCardProps) => {
  const { data: tracks } = useRegionTracks(region.id);
  const { play } = useAudio();
  const preview = tracks?.slice(0, 3) ?? [];

  return (
    <div
      className="flex-shrink-0 w-72 rounded-xl border border-border bg-card overflow-hidden cursor-pointer group transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <p className="font-bold text-lg text-foreground leading-tight">{region.name}</p>
        <p className="text-sm text-muted-foreground">{region.country}</p>
      </div>

      {/* Track Previews */}
      <div className="px-3 pb-4 space-y-1">
        {preview.length > 0 ? (
          preview.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                play(track);
              }}
            >
              <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 group/play">
                <Play className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist?.name}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 px-2 py-3 text-muted-foreground">
            <Music className="w-4 h-4" />
            <span className="text-xs">No tracks yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface RegionCarouselProps {
  regions: Region[];
  currentRegionId: string;
  onRegionSelect: (id: string) => void;
}

export const RegionCarousel = ({ regions, currentRegionId, onRegionSelect }: RegionCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const filtered = regions.filter((r) => r.id !== currentRegionId);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="space-y-4 pt-8 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">Explore Other Frequencies</h3>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => scroll("left")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => scroll("right")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filtered.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            onClick={() => onRegionSelect(region.id)}
          />
        ))}
      </div>
    </section>
  );
};
