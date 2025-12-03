import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, Users, MapPin } from "lucide-react";
import type { Artist } from "@/hooks/useRegions";

interface ArtistCardProps {
  artist: Artist & {
    region?: {
      name: string;
      country: string;
    } | null;
  };
  compact?: boolean;
}

const formatListenerCount = (count: number | null): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

export const ArtistCard = ({ artist, compact = false }: ArtistCardProps) => {
  if (compact) {
    return (
      <div className="group flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
          {artist.image_url ? (
            <img 
              src={artist.image_url} 
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {artist.name}
            </h4>
            {artist.is_emerging && (
              <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatListenerCount(artist.listener_count)}
            </span>
            {artist.region && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                {artist.region.name}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="group bg-card/60 hover:bg-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Artist Avatar */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
            {artist.image_url ? (
              <img 
                src={artist.image_url} 
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>

          {/* Artist Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {artist.name}
              </h3>
              {artist.is_emerging && (
                <Badge variant="secondary" className="gap-1 text-xs bg-accent/20 text-accent-foreground flex-shrink-0">
                  <Sparkles className="w-3 h-3" />
                  Emerging
                </Badge>
              )}
            </div>
            
            {artist.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {artist.bio}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatListenerCount(artist.listener_count)} listeners
              </span>
              {artist.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {artist.region.name}, {artist.region.country}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
