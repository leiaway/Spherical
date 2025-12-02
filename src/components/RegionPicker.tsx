import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Shuffle, MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Region } from "@/hooks/useRegions";

interface RegionPickerProps {
  regions: Region[];
  currentRegionId: string | null;
  onRegionChange: (regionId: string) => void;
  onRandomRegion: () => void;
  nearestRegionId?: string | null;
}

export const RegionPicker = ({
  regions,
  currentRegionId,
  onRegionChange,
  onRandomRegion,
  nearestRegionId,
}: RegionPickerProps) => {
  const currentRegion = regions.find((r) => r.id === currentRegionId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="w-5 h-5 text-primary" />
        <span className="font-medium">Exploring:</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
            <span className="truncate">
              {currentRegion?.name || "Select Region"}
            </span>
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          {regions.map((region) => (
            <DropdownMenuItem
              key={region.id}
              onClick={() => onRegionChange(region.id)}
              className="flex items-center justify-between py-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{region.name}</span>
                  {region.id === nearestRegionId && (
                    <Badge variant="secondary" className="text-xs gap-1 bg-primary/20 text-primary">
                      <MapPin className="w-2 h-2" />
                      Nearest
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{region.country}</p>
              </div>
              {currentRegionId === region.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={onRandomRegion}
        variant="secondary"
        size="sm"
        className="gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Random
      </Button>

      {nearestRegionId && currentRegionId !== nearestRegionId && (
        <Button
          onClick={() => onRegionChange(nearestRegionId)}
          variant="ghost"
          size="sm"
          className="gap-2 text-primary hover:text-primary"
        >
          <MapPin className="w-4 h-4" />
          Back to Local
        </Button>
      )}
    </div>
  );
};
