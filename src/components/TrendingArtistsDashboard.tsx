import { TrendingUp, Loader2, Music2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmergingArtists } from "@/hooks/useRegions";

/** Requirement: F1.9 (talent scout — discover emerging artists across regions). */

export const TrendingArtistsDashboard = () => {
    const { data: artists, isLoading } = useEmergingArtists();

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trending Local Artists
                </CardTitle>
                <CardDescription>
                    Emerging talent gaining traction across regions
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : artists && artists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {artists.slice(0, 8).map((artist, index) => (
                            <div
                                key={artist.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
                            >
                                <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">
                                    {index + 1}
                                </span>
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={artist.image_url ?? undefined} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {artist.name?.[0]?.toUpperCase() ?? '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{artist.name}</p>
                                    {artist.listener_count != null && (
                                        <p className="text-xs text-muted-foreground">
                                            {artist.listener_count.toLocaleString()} listeners
                                        </p>
                                    )}
                                </div>
                                {artist.is_emerging && (
                                    <Badge
                                        variant="outline"
                                        className="bg-accent/10 text-accent border-accent/20 text-[10px] flex-shrink-0"
                                    >
                                        Emerging
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Music2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No emerging artists found yet</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
