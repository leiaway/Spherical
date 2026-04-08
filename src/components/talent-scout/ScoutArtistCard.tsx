import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, BarChart3 } from "lucide-react";
import type { ArtistTrackStats, ScoutArtistRow } from "@/lib/scoutArtistFilters";

type ScoutArtistCardProps = {
  artist: ScoutArtistRow;
  stats?: ArtistTrackStats | null;
  saved: boolean;
  onToggleSave: () => void;
  onAnalytics: () => void;
  /** Wider layout for carousel slides */
  variant?: "default" | "carousel";
};

export function ScoutArtistCard({
  artist,
  stats,
  saved,
  onToggleSave,
  onAnalytics,
  variant = "default",
}: ScoutArtistCardProps) {
  return (
    <Card
      className={
        variant === "carousel"
          ? "overflow-hidden border-border bg-card/80 h-full"
          : "overflow-hidden border-border bg-card/80"
      }
    >
      <CardContent className={variant === "carousel" ? "p-4 flex flex-col gap-3 h-full" : "p-4 flex flex-col gap-3"}>
        <div className="flex gap-3 min-h-0">
          <div
            className="w-14 h-14 shrink-0 rounded-lg bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground overflow-hidden"
            style={
              artist.image_url
                ? {
                    backgroundImage: `url(${artist.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!artist.image_url ? artist.name.charAt(0).toUpperCase() : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground truncate">{artist.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {artist.region
                ? `${artist.region.name}, ${artist.region.country}`
                : "No region"}
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {artist.is_emerging ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Emerging
                </Badge>
              ) : null}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                {(artist.listener_count ?? 0).toLocaleString()} listeners
              </Badge>
              {stats ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                  {stats.trackCount} tracks · {(stats.totalPlayCount ?? 0).toLocaleString()} plays
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <Button
            type="button"
            variant={saved ? "secondary" : "outline"}
            size="sm"
            className="flex-1 gap-1 text-xs"
            onClick={onToggleSave}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 text-xs px-2"
            onClick={onAnalytics}
            aria-label={`Analytics for ${artist.name}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
