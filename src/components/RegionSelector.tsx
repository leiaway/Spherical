import { Button } from "@/components/ui/button";
import { Globe, Shuffle } from "lucide-react";

interface Region {
  id: string;
  name: string;
  country: string;
}

interface RegionSelectorProps {
  regions: Region[];
  currentRegion: string;
  onRegionChange: (regionId: string) => void;
  onRandomRegion: () => void;
}

export const RegionSelector = ({ 
  regions, 
  currentRegion, 
  onRegionChange,
  onRandomRegion 
}: RegionSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Explore Regions</h2>
        </div>
        <Button 
          onClick={onRandomRegion}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Shuffle className="w-4 h-4" />
          Random
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {regions.map((region) => (
          <Button
            key={region.id}
            onClick={() => onRegionChange(region.id)}
            variant={currentRegion === region.id ? "default" : "outline"}
            className={`h-auto py-3 flex flex-col items-start text-left transition-all ${
              currentRegion === region.id 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'hover:border-primary'
            }`}
          >
            <span className="font-semibold text-sm">{region.name}</span>
            <span className="text-xs opacity-70">{region.country}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
