import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { useAuthUserId } from "@/hooks/useAuthSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useRegions } from "@/hooks/useRegions";
import { useGenres } from "@/hooks/useGenres";
import { useScoutSavedArtistIds } from "@/hooks/useScoutSavedArtistIds";
import {
  useMergedArtistIdsForStats,
  useScoutRegionalTrending,
  useScoutSavedArtistsDetail,
  useScoutTrackStatsForArtists,
} from "@/hooks/useScoutDashboardQueries";
import {
  defaultScoutFilterState,
  filterScoutArtists,
  type ScoutArtistRow,
  type ScoutFilterState,
} from "@/lib/scoutArtistFilters";
import { getErrorMessage } from "@/lib/queryErrors";
import { useToast } from "@/hooks/use-toast";
import { ScoutDashboardFilters } from "@/components/talent-scout/ScoutDashboardFilters";
import { RegionalTrendingCarousel } from "@/components/talent-scout/RegionalTrendingCarousel";
import {
  SavedArtistsSection,
  exportSavedArtistsCsv,
} from "@/components/talent-scout/SavedArtistsSection";
import { ArtistAnalyticsDialog } from "@/components/talent-scout/ArtistAnalyticsDialog";

const TalentScoutDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuthUserId();
  const { profile } = useUserRole();
  const scoutRegionId = profile?.current_region_id ?? null;

  const { savedIds, toggleSaved } = useScoutSavedArtistIds(userId);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const [filters, setFilters] = useState<ScoutFilterState>(defaultScoutFilterState);
  const [analyticsArtist, setAnalyticsArtist] = useState<ScoutArtistRow | null>(null);

  const { data: regions } = useRegions();
  const { data: genres } = useGenres();

  const savedQuery = useScoutSavedArtistsDetail(userId, savedIds);
  const savedArtists = savedIds.length === 0 ? [] : savedQuery.data ?? [];
  const savedLoading = savedIds.length > 0 && savedQuery.isPending;

  const trendingQuery = useScoutRegionalTrending(scoutRegionId);
  const trendingRaw = trendingQuery.data ?? [];

  const mergedIds = useMergedArtistIdsForStats(savedIds, trendingRaw);
  const statsQuery = useScoutTrackStatsForArtists(mergedIds);
  const statsMap = statsQuery.data ?? new Map();

  const filteredSaved = useMemo(
    () => filterScoutArtists(savedArtists, statsMap, filters),
    [savedArtists, statsMap, filters]
  );

  const filteredTrending = useMemo(
    () => filterScoutArtists(trendingRaw, statsMap, filters),
    [trendingRaw, statsMap, filters]
  );

  useEffect(() => {
    if (!savedQuery.error) return;
    toast({
      title: "Could not load saved artists",
      description: getErrorMessage(savedQuery.error),
      variant: "destructive",
    });
  }, [savedQuery.error, toast]);

  useEffect(() => {
    if (!trendingQuery.error) return;
    toast({
      title: "Could not load regional trending",
      description: getErrorMessage(trendingQuery.error),
      variant: "destructive",
    });
  }, [trendingQuery.error, toast]);

  useEffect(() => {
    if (!statsQuery.error) return;
    toast({
      title: "Could not load track stats",
      description: getErrorMessage(statsQuery.error),
      variant: "destructive",
    });
  }, [statsQuery.error, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/talent-scout/login", { replace: true });
  };

  const handleExportSaved = () => {
    if (filteredSaved.length === 0) return;
    try {
      exportSavedArtistsCsv(filteredSaved, statsMap);
      toast({
        title: "Export ready",
        description: "CSV download should begin shortly.",
      });
    } catch (e) {
      toast({
        title: "Export failed",
        description: getErrorMessage(e),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/20 to-background">
      <header className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            <div>
              <span className="font-semibold text-foreground block leading-tight">
                Talent Scout
              </span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">FREQUENCY</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Saved artists, regional momentum, and exports—filtered the way you work.
          </p>
        </div>

        <ScoutDashboardFilters
          filters={filters}
          onChange={setFilters}
          regions={regions}
          genres={genres}
        />

        <SavedArtistsSection
          artists={filteredSaved}
          statsByArtist={statsMap}
          isLoading={savedLoading}
          onToggleSave={toggleSaved}
          onAnalytics={setAnalyticsArtist}
          onExportCsv={handleExportSaved}
          exporting={false}
        />

        <RegionalTrendingCarousel
          artists={filteredTrending}
          statsByArtist={statsMap}
          scoutRegionId={scoutRegionId}
          savedIds={savedSet}
          onToggleSave={toggleSaved}
          onAnalytics={setAnalyticsArtist}
        />
      </main>

      <ArtistAnalyticsDialog
        artist={analyticsArtist}
        open={!!analyticsArtist}
        onOpenChange={(open) => {
          if (!open) setAnalyticsArtist(null);
        }}
        stats={analyticsArtist ? statsMap.get(analyticsArtist.id) : undefined}
      />
    </div>
  );
};

export default TalentScoutDashboard;
