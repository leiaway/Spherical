import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Music } from "lucide-react";

export interface FriendProfileCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  homeRegion?: string;
  musicalDna: string[];
  connectionStatus?: "none" | "pending" | "mutual";
  onConnectAction?: () => void;
}

export const FriendProfileCard = ({
  name,
  avatarUrl,
  homeRegion,
  musicalDna,
}: FriendProfileCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group border-border/50 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4 pt-6 flex flex-row items-start gap-4 space-y-0">
        <Avatar className="w-16 h-16 border-2 border-primary/20 ring-2 ring-background transition-transform group-hover:scale-105 duration-300">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold text-primary">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
            {name}
          </h3>
          {homeRegion && (
            <div className="flex items-center text-sm text-muted-foreground font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-primary/70" />
              {homeRegion}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Musical DNA */}
        {musicalDna.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 mr-1.5" />
              Musical DNA
            </div>
            <div className="flex flex-wrap gap-1.5">
              {musicalDna.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-secondary/40 hover:bg-secondary/60 text-secondary-foreground transition-colors border-transparent"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
