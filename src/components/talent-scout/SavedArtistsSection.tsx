import { Button } from "@/components/ui/button";
import { Bookmark, Download, Loader2 } from "lucide-react";
import type { ScoutArtistRow } from "@/lib/scoutArtistFilters";
import type { ArtistTrackStats } from "@/lib/scoutArtistFilters";
import { ScoutArtistCard } from "./ScoutArtistCard";
import { downloadCsv, formatExportDateStamp } from "@/lib/csvExport";

type SavedArtistsSectionProps = {
  artists: ScoutArtistRow[];
  statsByArtist: Map<string, ArtistTrackStats>;
  isLoading: boolean;
  onToggleSave: (id: string) => void;
  onAnalytics: (artist: ScoutArtistRow) => void;
  onExportCsv: () => void;
  exporting: boolean;
};

export function SavedArtistsSection({
  artists,
  statsByArtist,
  isLoading,
  onToggleSave,
  onAnalytics,
  onExportCsv,
  exporting,
}: SavedArtistsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-sm text-foreground">Saved artists</h2>
          <span className="text-xs text-muted-foreground">({artists.length})</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          disabled={artists.length === 0 || exporting}
          onClick={onExportCsv}
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Export saved (CSV)
        </Button>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-4">
          Saved artists are stored in this browser for now. Set your home region on FREQUENCY to
          tune the trending carousel.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            No saved artists match the current filters. Save artists from the carousel or clear
            filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {artists.map((artist) => (
              <ScoutArtistCard
                key={artist.id}
                artist={artist}
                stats={statsByArtist.get(artist.id)}
                saved
                onToggleSave={() => onToggleSave(artist.id)}
                onAnalytics={() => onAnalytics(artist)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function buildSavedArtistsExportRows(
  artists: ScoutArtistRow[],
  statsByArtist: Map<string, ArtistTrackStats>
): (string | number)[][] {
  return artists.map((a) => {
    const s = statsByArtist.get(a.id);
    return [
      a.name,
      a.region?.name ?? "",
      a.region?.country ?? "",
      a.listener_count ?? "",
      a.is_emerging ? "yes" : "no",
      a.created_at,
      s?.trackCount ?? 0,
      s?.totalPlayCount ?? 0,
      s?.genreNames.join("; ") ?? "",
    ];
  });
}

export function exportSavedArtistsCsv(
  artists: ScoutArtistRow[],
  statsByArtist: Map<string, ArtistTrackStats>
): void {
  const headers = [
    "name",
    "region",
    "country",
    "listener_count",
    "emerging",
    "created_at",
    "track_count",
    "total_plays",
    "genres",
  ];
  const rows = buildSavedArtistsExportRows(artists, statsByArtist);
  downloadCsv(
    `talent-scout-saved-artists-${formatExportDateStamp()}.csv`,
    headers,
    rows
  );
}
