import { Eye, EyeOff, Loader2, Search, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScoutWatchlist } from "@/hooks/useScoutWatchlist";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Requirement: F1.10 (talent scout — watchlist panel). */

export const ScoutWatchlistPanel = () => {
    const { user } = useAuth();
    const { watchlist, isLoading, watchArtist, unwatchArtist } = useScoutWatchlist();
    const { toast } = useToast();
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = async () => {
        if (!searchInput.trim()) return;
        const { data } = await supabase
            .from('artists')
            .select('id, name')
            .ilike('name', `%${searchInput.trim()}%`)
            .limit(1)
            .single();
        if (data) {
            void watchArtist(data.id);
            setSearchInput("");
        } else {
            toast({ title: 'Artist not found', variant: 'destructive' });
        }
    };

    if (!user) return null;

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-4 h-4 text-accent" />
                    Scout Watchlist
                </CardTitle>
                <CardDescription>
                    Track emerging artists and get notified when they gain traction
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Artist search */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Search artist to watch…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
                        className="text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => void handleSearch()}>
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                ) : watchlist.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Search for an artist above to start watching them
                    </p>
                ) : (
                    <div className="space-y-2">
                        {watchlist.map((w) => (
                            <div
                                key={w.watch_id}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-background/50 border border-border/40"
                            >
                                <Avatar className="w-9 h-9 flex-shrink-0">
                                    <AvatarImage src={w.artist_image ?? undefined} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                        {w.artist_name[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{w.artist_name}</p>
                                    {w.listener_count != null && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {w.listener_count.toLocaleString()} listeners
                                        </p>
                                    )}
                                </div>
                                {w.is_emerging && (
                                    <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                                        Emerging
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => void unwatchArtist(w.watch_id)}
                                >
                                    <EyeOff className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
