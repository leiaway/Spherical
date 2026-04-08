import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { ScoutArtistRow } from "@/lib/scoutArtistFilters";
import type { ArtistTrackStats } from "@/lib/scoutArtistFilters";
import { useScoutArtistTracks } from "@/hooks/useScoutDashboardQueries";
import { downloadCsv, formatExportDateStamp } from "@/lib/csvExport";
import { useToast } from "@/hooks/use-toast";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48);
}

type ArtistAnalyticsDialogProps = {
  artist: ScoutArtistRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: ArtistTrackStats | null | undefined;
};

export function ArtistAnalyticsDialog({
  artist,
  open,
  onOpenChange,
  stats,
}: ArtistAnalyticsDialogProps) {
  const { toast } = useToast();
  const { data: tracks, isPending } = useScoutArtistTracks(artist?.id ?? null, open);

  const handleExport = () => {
    if (!artist) return;

    const headers = ["row_type", "field", "value", "extra"];
    const rows: (string | number)[][] = [];
    rows.push(["artist", "id", artist.id, ""]);
    rows.push(["artist", "name", artist.name, ""]);
    rows.push([
      "artist",
      "listener_count",
      artist.listener_count ?? "",
      "",
    ]);
    rows.push(["artist", "emerging", artist.is_emerging ? "yes" : "no", ""]);
    rows.push(["artist", "region", artist.region?.name ?? "", artist.region?.country ?? ""]);
    rows.push(["artist", "created_at", artist.created_at, ""]);
    if (stats) {
      rows.push(["artist", "track_count", stats.trackCount, ""]);
      rows.push(["artist", "total_track_plays", stats.totalPlayCount, ""]);
      rows.push(["artist", "genres_from_tracks", stats.genreNames.join("; "), ""]);
    }

    for (const t of tracks ?? []) {
      const g = t.genre as { name: string } | null;
      rows.push(["track", t.title ?? "", t.play_count ?? 0, g?.name ?? ""]);
    }

    try {
      downloadCsv(
        `scout-artist-analytics-${slugify(artist.name)}-${formatExportDateStamp()}.csv`,
        headers,
        rows
      );
      toast({ title: "Export ready", description: "Analytics CSV has been downloaded." });
    } catch {
      toast({
        title: "Export failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {artist ? `Analytics — ${artist.name}` : "Artist analytics"}
          </DialogTitle>
        </DialogHeader>

        {artist ? (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <dt className="text-muted-foreground">Listeners</dt>
              <dd className="font-medium">{artist.listener_count?.toLocaleString() ?? "—"}</dd>
              <dt className="text-muted-foreground">Tracks (catalog)</dt>
              <dd className="font-medium">{stats?.trackCount ?? "—"}</dd>
              <dt className="text-muted-foreground">Total plays (tracks)</dt>
              <dd className="font-medium">
                {stats?.totalPlayCount.toLocaleString() ?? "—"}
              </dd>
              <dt className="text-muted-foreground">Genres (from tracks)</dt>
              <dd className="font-medium">
                {stats?.genreNames.length ? stats.genreNames.join(", ") : "—"}
              </dd>
            </dl>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Tracks
              </p>
              {isPending ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (tracks ?? []).length === 0 ? (
                <p className="text-muted-foreground text-xs">No tracks for this artist.</p>
              ) : (
                <ul className="border border-border rounded-md divide-y max-h-48 overflow-y-auto">
                  {(tracks ?? []).map((t) => {
                    const g = t.genre as { name: string } | null;
                    return (
                      <li
                        key={t.id}
                        className="px-3 py-2 flex justify-between gap-2 text-xs"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="shrink-0 text-muted-foreground">
                          {(t.play_count ?? 0).toLocaleString()}
                          {g?.name ? ` · ${g.name}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Button
              type="button"
              className="w-full gap-2"
              onClick={handleExport}
              disabled={isPending}
            >
              <Download className="w-4 h-4" />
              Export analytics (CSV)
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
