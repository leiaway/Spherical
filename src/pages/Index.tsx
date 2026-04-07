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
import { EmergingArtistsRecommendations } from "@/components/EmergingArtistsRecommendations";
import { PlaylistManager } from "@/components/PlaylistManager";
import { TrackUploadDialog } from "@/components/TrackUploadDialog";
import { SuggestedFriends } from "@/components/SuggestedFriends";
import { NotificationBell } from "@/components/NotificationBell";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRegions } from "@/hooks/useRegions";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Radio, LogIn, LogOut, Loader2, Users, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroGlobe from "@/assets/hero-globe.jpg";
import { supabase } from "@/integrations/supabase/client";

/**
 * Home page: hero, location prompt (or region picker + discovery), discovery section, sidebar (map, playlists, emerging artists, friends).
 * Auto-selects nearest region when geolocation is available; supports skip and random region.
 * @requirement F1, F2, F3, F4, F5, F7, F8. See docs/REQUIREMENTS_REFERENCE.md
 */
const Index = () => {
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);

  const {
    latitude,
    error: locationError,
    loading: locationLoading,
    nearestRegion,
    requestLocation,
  } = useGeolocation();

  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loadingPreference, setLoadingPreference] = useState(true);

  // Load location preference from database on mount
  useEffect(() => {
    const loadLocationPreference = async () => {
      if (!user) {
        setLoadingPreference(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('location_enabled')
          .eq('id', user.id)
          .single();

        // If user has already made a choice (location_enabled is not null), dismiss the prompt
        if (data?.location_enabled !== null) {
          setLocationPromptDismissed(true);
        }
      } catch (error) {
        console.error('Failed to load location preference:', error);
      } finally {
        setLoadingPreference(false);
      }
    };

    loadLocationPreference();
  }, [user]);

  // F1.2 — Resolve user's home country to a region for mixing
  const { data: profile } = useProfile();
  const homeRegion = null; // TODO: implement useRegionByCountry

  // When we get a nearest region from geolocation, auto-select it and hide the location prompt
  useEffect(() => {
    if (nearestRegion && !currentRegionId) {
      setCurrentRegionId(nearestRegion.id);
      setLocationPromptDismissed(true);
      // Save that location is enabled
      if (user) {
        const savePreference = async () => {
          try {
            await supabase
              .from('profiles')
              .update({ location_enabled: true })
              .eq('id', user.id);
          } catch (error) {
            console.error('Failed to save location preference:', error);
          }
        };
        savePreference();
      }
    }
  }, [nearestRegion, currentRegionId, user]);

  // Skip location: pick a random region so user can still explore
  const handleSkipLocation = async () => {
    if (regions && regions.length > 0) {
      const randomIndex = Math.floor(Math.random() * regions.length);
      setCurrentRegionId(regions[randomIndex].id);
    }
    setLocationPromptDismissed(true);

    // Save that user chose to explore globally (location disabled)
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ location_enabled: false })
          .eq('id', user.id);
      } catch (error) {
        console.error('Failed to save location preference:', error);
      }
    }
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
              <div className="flex items-center gap-2">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserIcon className="w-4 h-4" />
                      {user.email || user.phone || "Account"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="text-sm"
                    >
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
              </div>
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
                    homeRegion={homeRegion}
                    userId={profile?.id ?? null}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Map */}
                <UserMap />

                {/* Playlists */}
                <PlaylistManager regionId={currentRegionId} regionName={currentRegion?.name} />

                {/* Track Upload */}
                <TrackUploadDialog regionId={currentRegionId} />

                {/* Emerging Artists Recommendations */}
                <EmergingArtistsRecommendations regionId={currentRegionId} />

                {/* Social Hub Link */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Social Hub</h3>
                        <p className="text-sm text-muted-foreground">Connect globally</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Find friends, share your musical frequency, and see the network you build.
                    </p>
                    <Link to="/social" className="block w-full">
                      <Button className="w-full gap-2" variant="outline">
                        <Radio className="w-4 h-4" />
                        Enter Frequency Network
                      </Button>
                    </Link>
                  </div>
                </div>
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
