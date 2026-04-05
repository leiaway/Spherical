import { MapPin, Radio, Sparkles, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendProfileCard } from "./FriendProfileCard";
import { SocialConnectionButtons } from "./SocialConnectionButtons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNearbyCreators } from "@/hooks/useNearbyCreators";
import { useSuggestedFriends } from "@/hooks/useSuggestedFriends";
import { useFriends } from "@/hooks/useFriends";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";

/** Requirement: F1.3 (connect users sharing musical background), F1.8 (artist collaboration with nearby creators). */

export const SocialDashboard = () => {
    const { data: profile } = useProfile();
    const regionId = profile?.current_region_id ?? null;

    const { data: nearbyCreators, isLoading: nearbyLoading } = useNearbyCreators(regionId);
    const { data: suggestions, isLoading: suggestionsLoading } = useSuggestedFriends();
    const { sendFriendRequest, friends, pendingRequests, currentUserId } = useFriends();

    // Track which profiles have had a request sent this session
    const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

    const handleAddFriend = async (profileId: string) => {
        await sendFriendRequest(profileId);
        setRequestedIds((prev) => new Set(prev).add(profileId));
    };

    const getConnectionState = (profileId: string) => {
        if (requestedIds.has(profileId)) return "pending";
        const isFriend = friends.some((f) =>
            f.user_id === profileId || f.friend_id === profileId
        );
        if (isFriend) return "mutual";
        const isPending = pendingRequests.some((r) =>
            r.user_id === profileId || r.friend_id === profileId
        );
        if (isPending) return "pending";
        return "add";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Active Status & Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Social Connection</h2>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Discover users who share your musical frequency.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${currentUserId ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="text-sm font-medium text-foreground">
                        {currentUserId ? 'You are visible to nearby users' : 'Sign in to connect'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Feed: Nearby Creators */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Nearby Creators
                        </h3>
                    </div>

                    {nearbyLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !currentUserId ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p>Sign in to see who's nearby</p>
                        </div>
                    ) : !regionId ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p>Enable location on the home page to find nearby creators</p>
                        </div>
                    ) : nearbyCreators && nearbyCreators.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {nearbyCreators.slice(0, 6).map((creator) => (
                                <div key={creator.id} className="relative">
                                    <FriendProfileCard
                                        id={creator.id}
                                        name={creator.display_name ?? 'Anonymous'}
                                        avatarUrl={creator.avatar_url ?? undefined}
                                        homeRegion={creator.home_country ?? undefined}
                                        musicalDna={[]}
                                    />
                                    <div className="absolute top-4 right-4 z-10">
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 backdrop-blur-md">
                                            <Radio className="w-3 h-3 mr-1 animate-pulse" /> Nearby
                                        </Badge>
                                    </div>
                                    <div className="mt-3">
                                        <SocialConnectionButtons
                                            state={getConnectionState(creator.id)}
                                            onClick={() => handleAddFriend(creator.id)}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p>No other creators in your region yet</p>
                            <p className="text-xs mt-1 opacity-70">Be the first to share your frequency here</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Suggested Matches */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-accent" />
                                Suggested Matches
                            </CardTitle>
                            <CardDescription>
                                Based on your musical DNA
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {suggestionsLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : !currentUserId ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Sign in to see suggested matches
                                </p>
                            ) : suggestions && suggestions.length > 0 ? (
                                <>
                                    {suggestions.slice(0, 4).map((suggestion) => {
                                        const matchPct = Math.min(99, suggestion.taste_score * 20);
                                        const tags = suggestion.match_reason === 'genre_overlap'
                                            ? ['Shared Genres']
                                            : ['Same Home Region'];

                                        return (
                                            <div key={suggestion.profile_id} className="flex flex-col gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-12 h-12 flex-shrink-0">
                                                        <AvatarImage src={suggestion.avatar_url ?? undefined} />
                                                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                                            {suggestion.display_name?.[0]?.toUpperCase() ?? '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm truncate">
                                                            {suggestion.display_name ?? 'Anonymous'}
                                                        </h4>
                                                        <Badge variant="secondary" className="text-xs bg-accent/10 text-accent mt-0.5">
                                                            {matchPct}% Match
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {tags.map((tag) => (
                                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <SocialConnectionButtons
                                                    state={getConnectionState(suggestion.profile_id)}
                                                    onClick={() => handleAddFriend(suggestion.profile_id)}
                                                    size="sm"
                                                    fullWidth
                                                />
                                            </div>
                                        );
                                    })}
                                    <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">
                                        View all suggestions
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Play some tracks to unlock music-based suggestions
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};
