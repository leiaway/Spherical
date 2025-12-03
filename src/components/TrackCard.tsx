import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, Music } from "lucide-react";
import type { Track } from "@/hooks/useRegions";
import { AddToPlaylistButton } from "./AddToPlaylistButton";

interface TrackCardProps {
  track: Track;
  index?: number;
}

const formatPlayCount = (count: number | null): string => {
  if (!count) return '0';
  if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B`;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const TrackCard = ({ track, index }: TrackCardProps) => {
  return (
    <Card className="group bg-card/60 hover:bg-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Track Number / Play Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            {index !== undefined ? (
              <span className="text-muted-foreground group-hover:hidden font-semibold">
                {index + 1}
              </span>
            ) : (
              <Music className="w-5 h-5 text-muted-foreground group-hover:hidden" />
            )}
            <Play className="w-5 h-5 text-primary hidden group-hover:block" />
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {track.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {track.artist && (
                <span className="truncate">{track.artist.name}</span>
              )}
              {track.artist?.is_emerging && (
                <Badge variant="secondary" className="gap-1 text-xs bg-accent/20 text-accent-foreground">
                  <Sparkles className="w-3 h-3" />
                  Rising
                </Badge>
              )}
            </div>
            {track.genre && (
              <Badge variant="outline" className="text-xs">
                {track.genre.name}
              </Badge>
            )}
          </div>

          {/* Play Count & Add to Playlist */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <span className="text-sm font-medium text-muted-foreground">
                {formatPlayCount(track.play_count)}
              </span>
              <p className="text-xs text-muted-foreground">plays</p>
            </div>
            <AddToPlaylistButton trackId={track.id} />
          </div>
        </div>

        {/* Cultural Context (on hover) */}
        {track.cultural_context && (
          <div className="mt-3 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {track.cultural_context}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
