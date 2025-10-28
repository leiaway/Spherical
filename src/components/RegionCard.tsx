import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, MapPin } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  genre: string;
}

interface RegionCardProps {
  region: string;
  country: string;
  tracks: Track[];
  description: string;
  isActive?: boolean;
  onExplore?: () => void;
}

export const RegionCard = ({ 
  region, 
  country, 
  tracks, 
  description, 
  isActive = false,
  onExplore 
}: RegionCardProps) => {
  return (
    <Card className={`p-6 space-y-4 transition-all duration-500 ${
      isActive 
        ? 'bg-gradient-to-br from-card to-muted border-primary shadow-lg' 
        : 'bg-card/50 hover:bg-card border-border'
    }`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">{region}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{country}</p>
        </div>
        {isActive && (
          <span className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">
            Current Location
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Popular Tracks</h4>
        {tracks.map((track, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <Play className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-background/50 rounded">
              {track.genre}
            </span>
          </div>
        ))}
      </div>
      
      {!isActive && onExplore && (
        <Button 
          onClick={onExplore}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          Explore This Region
        </Button>
      )}
    </Card>
  );
};
