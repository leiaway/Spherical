import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, Users } from "lucide-react";
import type { Artist } from "@/hooks/useRegions";

interface ArtistCardProps {
  artist: Artist;
}

const formatListenerCount = (count: number | null): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

export const ArtistCard = ({ artist }: ArtistCardProps) => {
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

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{formatListenerCount(artist.listener_count)} listeners</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
