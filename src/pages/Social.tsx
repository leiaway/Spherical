import { SocialDashboard } from "@/components/SocialDashboard";
import { TrendingArtistsDashboard } from "@/components/TrendingArtistsDashboard";
import { ScoutWatchlistPanel } from "@/components/ScoutWatchlistPanel";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Social = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="group">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </Link>
                    <span className="font-semibold text-foreground">Global Frequency</span>
                </div>
            </header>

            {/* Main Content Dashboard */}
            <main className="container mx-auto px-4 py-8 md:py-12 space-y-12">
                <SocialDashboard />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <TrendingArtistsDashboard />
                    </div>
                    <div className="lg:col-span-4">
                        <ScoutWatchlistPanel />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Social;