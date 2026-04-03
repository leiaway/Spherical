import { MapPin, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendProfileCard } from "./FriendProfileCard";
import { SocialConnectionButtons } from "./SocialConnectionButtons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock Data for layout demonstration
const NEARBY_CREATORS = [
    {
        id: "1",
        name: "Elena Rodriguez",
        avatarUrl: "https://i.pravatar.cc/150?u=elena",
        homeRegion: "Barcelona, Spain",
        musicalDna: ["Flamenco", "Indie Pop", "Electronic"],
        status: "active",
    },
    {
        id: "2",
        name: "Kenji Sato",
        avatarUrl: "https://i.pravatar.cc/150?u=kenji",
        homeRegion: "Tokyo, Japan",
        musicalDna: ["City Pop", "Jazz", "Lo-Fi"],
        status: "offline",
    }
];

const SUGGESTED_CONNECTIONS = [
    {
        id: "3",
        name: "Aisha Fofana",
        avatarUrl: "https://i.pravatar.cc/150?u=aisha",
        homeRegion: "Dakar, Senegal",
        musicalDna: ["Afrobeats", "Jazz", "Soul"],
        mutualMatch: "85%",
    },
    {
        id: "4",
        name: "Marcus Chen",
        avatarUrl: "https://i.pravatar.cc/150?u=marcus",
        homeRegion: "Toronto, Canada",
        musicalDna: ["R&B", "Electronic", "Ambient"],
        mutualMatch: "72%",
    }
];

export const SocialDashboard = () => {
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
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-foreground">You are visible to nearby users</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Main Feed: Nearest / Active */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Nearby Creators
                        </h3>
                        <Button variant="ghost" size="sm" className="text-primary">
                            View Map
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {NEARBY_CREATORS.map((creator) => (
                            <div key={creator.id} className="relative">
                                <FriendProfileCard
                                    id={creator.id}
                                    name={creator.name}
                                    avatarUrl={creator.avatarUrl}
                                    homeRegion={creator.homeRegion}
                                    musicalDna={creator.musicalDna}
                                />
                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                                    {creator.status === "active" && (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 backdrop-blur-md">
                                            <Radio className="w-3 h-3 mr-1 animate-pulse" /> Live Now
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <SocialConnectionButtons state="add" fullWidth />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Suggested */}
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
                            {SUGGESTED_CONNECTIONS.map((suggestion) => (
                                <div key={suggestion.id} className="flex flex-col gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={suggestion.avatarUrl}
                                            alt={suggestion.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">{suggestion.name}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{suggestion.homeRegion}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs shrink-0 bg-accent/10 text-accent">
                                            {suggestion.mutualMatch} Match
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {suggestion.musicalDna.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/30 text-secondary-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pt-2">
                                        <SocialConnectionButtons state="add" size="sm" fullWidth />
                                    </div>
                                </div>
                            ))}

                            <Button variant="ghost" className="w-full text-xs text-muted-foreground mt-2">
                                View all suggestions
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};
