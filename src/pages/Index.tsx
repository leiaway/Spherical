import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationPrompt } from "@/components/LocationPrompt";
import { DiscoverySection } from "@/components/DiscoverySection";
import { RegionPicker } from "@/components/RegionPicker";
import { UserMap } from "@/components/UserMap";
import { FriendsList } from "@/components/FriendsList";
import { AddFriend } from "@/components/AddFriend";
import { EmergingArtistsRecommendations } from "@/components/EmergingArtistsRecommendations";
import { PlaylistManager } from "@/components/PlaylistManager";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRegions } from "@/hooks/useRegions";
import { useAuth } from "@/hooks/useAuth";
import { Radio, LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import heroGlobe from "@/assets/hero-globe.jpg";

/**
 * Home page: hero, location prompt (or region picker + discovery), discovery section, sidebar (map, playlists, emerging artists, friends).
 * Auto-selects nearest region when geolocation is available; supports skip and random region.
 * @requirement F1, F2, F3, F4, F5, F7, F8. See docs/REQUIREMENTS_REFERENCE.md
 */
const Index = () => {
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const navigate = useNavigate();

  const {
    latitude,
    error: locationError,
    loading: locationLoading,
    nearestRegion,
    requestLocation,
  } = useGeolocation();

  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { user, loading: authLoading, signOut } = useAuth();

  // When we get a nearest region from geolocation, auto-select it and hide the location prompt
  useEffect(() => {
    if (nearestRegion && !currentRegionId) {
      setCurrentRegionId(nearestRegion.id);
      setLocationPromptDismissed(true);
    }
  }, [nearestRegion, currentRegionId]);

  // Skip location: pick a random region so user can still explore
  const handleSkipLocation = () => {
    if (regions && regions.length > 0) {
      const randomIndex = Math.floor(Math.random() * regions.length);
      setCurrentRegionId(regions[randomIndex].id);
    }
    setLocationPromptDismissed(true);
  };

  const handleRandomRegion = () => {
    if (regions && regions.length > 0) {
      const otherRegions = regions.filter((r) => r.id !== currentRegionId);
      const randomIndex = Math.floor(Math.random() * otherRegions.length);
      setCurrentRegionId(otherRegions[randomIndex].id);
    }
  };

  const currentRegion = regions?.find((r) => r.id === currentRegionId);
  const showLocationPrompt = !locationPromptDismissed && !latitude && !regionsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroGlobe})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8 text-primary animate-pulse" />
              <span className="text-xl font-bold text-foreground">FREQUENCY</span>
            </div>
            {authLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserIcon className="w-4 h-4" />
                    {user.email || user.phone || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-sm">
                    {user.email || user.phone}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                    className="gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Discover Music Beyond Borders
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Break free from algorithms. Explore authentic music from every corner of the world based on where you are.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {regionsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : showLocationPrompt ? (
          <div className="py-12">
            <LocationPrompt
              onEnableLocation={requestLocation}
              onSkip={handleSkipLocation}
              loading={locationLoading}
              error={locationError}
            />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Region Picker */}
            {regions && regions.length > 0 && (
              <RegionPicker
                regions={regions}
                currentRegionId={currentRegionId}
                onRegionChange={setCurrentRegionId}
                onRandomRegion={handleRandomRegion}
                nearestRegionId={nearestRegion?.id}
              />
            )}

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Discovery Section - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {currentRegion && (
                  <DiscoverySection
                    region={currentRegion}
                    isLocationBased={nearestRegion?.id === currentRegionId}
                    distance={nearestRegion?.id === currentRegionId ? nearestRegion.distance : undefined}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Map */}
                <UserMap />

                {/* Playlists */}
                <PlaylistManager regionId={currentRegionId} regionName={currentRegion?.name} />

                {/* Emerging Artists Recommendations */}
                <EmergingArtistsRecommendations regionId={currentRegionId} />

                {/* Friends List */}
                <FriendsList />

                {/* Add Friend */}
                <AddFriend />
              </div>
            </div>

            {/* Other Regions */}
            {regions && regions.length > 1 && (
              <section className="space-y-6 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-foreground">
                  Explore Other Frequencies
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {regions
                    .filter((r) => r.id !== currentRegionId)
                    .map((region) => (
                      <Button
                        key={region.id}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-start text-left hover:border-primary hover:bg-primary/5"
                        onClick={() => setCurrentRegionId(region.id)}
                      >
                        <span className="font-semibold text-sm">{region.name}</span>
                        <span className="text-xs text-muted-foreground">{region.country}</span>
                      </Button>
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Discover music that transcends borders and celebrates cultural diversity
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
