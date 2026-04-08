import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, RotateCcw } from "lucide-react";
import type { Region } from "@/hooks/useRegions";
import type { ScoutFilterState } from "@/lib/scoutArtistFilters";
import { defaultScoutFilterState } from "@/lib/scoutArtistFilters";

type GenreRow = { id: string; name: string };

type ScoutDashboardFiltersProps = {
  filters: ScoutFilterState;
  onChange: (next: ScoutFilterState) => void;
  regions: Region[] | undefined;
  genres: GenreRow[] | undefined;
};

export function ScoutDashboardFilters({
  filters,
  onChange,
  regions,
  genres,
}: ScoutDashboardFiltersProps) {
  const toggleRegion = (id: string) => {
    const next = filters.regionIds.includes(id)
      ? filters.regionIds.filter((x) => x !== id)
      : [...filters.regionIds, id];
    onChange({ ...filters, regionIds: next });
  };

  const toggleGenre = (id: string) => {
    const next = filters.genreIds.includes(id)
      ? filters.genreIds.filter((x) => x !== id)
      : [...filters.genreIds, id];
    onChange({ ...filters, genreIds: next });
  };

  const recencyOptions: { label: string; value: number | null }[] = [
    { label: "Any time", value: null },
    { label: "Last 7 days", value: 7 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
  ];

  return (
    <section className="rounded-xl border border-border bg-card/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filters
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-xs h-8"
          onClick={() => onChange(defaultScoutFilterState())}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="scout-search">Search name</Label>
          <Input
            id="scout-search"
            placeholder="Artist name…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Listener count (min)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.listenerMin ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                listenerMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Listener count (max)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.listenerMax ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                listenerMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Min total track plays</Label>
          <Input
            type="number"
            min={0}
            placeholder="Sum of plays"
            value={filters.totalPlaysMin ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                totalPlaysMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="scout-emerging"
            checked={filters.emergingOnly}
            onCheckedChange={(v) =>
              onChange({ ...filters, emergingOnly: v === true })
            }
          />
          <Label htmlFor="scout-emerging" className="font-normal cursor-pointer">
            Emerging only
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground whitespace-nowrap">Joined</Label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={filters.createdWithinDays ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                createdWithinDays:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
          >
            {recencyOptions.map((o) => (
              <option key={o.label} value={o.value ?? ""}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Regions
              {filters.regionIds.length > 0
                ? ` (${filters.regionIds.length})`
                : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 max-h-64 overflow-y-auto" align="start">
            {(regions ?? []).map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2 py-1.5 px-1 text-sm cursor-pointer hover:bg-muted/50 rounded"
              >
                <Checkbox
                  checked={filters.regionIds.includes(r.id)}
                  onCheckedChange={() => toggleRegion(r.id)}
                />
                <span className="truncate">{r.name}</span>
              </label>
            ))}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Genres
              {filters.genreIds.length > 0 ? ` (${filters.genreIds.length})` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 max-h-64 overflow-y-auto" align="start">
            {(genres ?? []).map((g) => (
              <label
                key={g.id}
                className="flex items-center gap-2 py-1.5 px-1 text-sm cursor-pointer hover:bg-muted/50 rounded"
              >
                <Checkbox
                  checked={filters.genreIds.includes(g.id)}
                  onCheckedChange={() => toggleGenre(g.id)}
                />
                <span className="truncate">{g.name}</span>
              </label>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}
