import { useState } from "react";
import { Sliders, Tag, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { regions } from "../lib/mockData";

export function AlgorithmSettings() {
  const [algorithmPriority, setAlgorithmPriority] = useState([65]); // 0-100 scale
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Bulawayo", "Seoul", "Buenos Aires"]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Afro-Jazz Fusion", "K-Indie Rock"]);

  const genres = [
    "Afro-Jazz Fusion",
    "K-Indie Rock",
    "Tango Electronico",
    "Celtic Folk Revival",
    "Anatolian Psychedelic",
    "Afrobeat",
    "Cumbia",
    "Fado",
  ];

  const toggleRegion = (regionName: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionName)
        ? prev.filter((r) => r !== regionName)
        : [...prev, regionName]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const getPriorityLabel = () => {
    if (algorithmPriority[0] < 33) return "Familiar Favorites";
    if (algorithmPriority[0] > 66) return "Total Discovery";
    return "Balanced Mix";
  };

  const getPriorityDescription = () => {
    if (algorithmPriority[0] < 33)
      return "Playing mostly songs you know and love";
    if (algorithmPriority[0] > 66)
      return "Excluding songs played in the last 30 days";
    return "Mix of familiar and new discoveries";
  };

  // Get current region colors for visual theming
  const currentRegion = regions.find((r) => r.name === "Bulawayo") || regions[0];

  return (
    <div className="min-h-screen pb-24 bg-zinc-950">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl mb-2">Algorithm Settings</h1>
        <p className="text-zinc-400">Control your discovery experience</p>
      </header>

      {/* Algorithm Priority Slider */}
      <div className="px-6 pb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
              Algorithm Priority
            </CardTitle>
            <CardDescription>
              Balance between familiar favorites and total discovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Priority Display */}
            <div className="text-center py-4">
              <div
                className="text-2xl mb-1"
                style={{
                  color: algorithmPriority[0] > 66 ? 'hsl(25 85% 60%)' : "#a1a1aa",
                }}
              >
                {getPriorityLabel()}
              </div>
              <p className="text-sm text-zinc-400">{getPriorityDescription()}</p>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <Slider
                value={algorithmPriority}
                onValueChange={setAlgorithmPriority}
                max={100}
                step={1}
                className="py-4"
              />

              {/* Labels */}
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Familiar Favorites</span>
                <span>Balanced</span>
                <span>Total Discovery</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 bg-zinc-800/50 rounded-lg">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(25 85% 60%)' }} />
              <div className="text-sm text-zinc-400">
                <p className="mb-2">
                  <strong className="text-zinc-200">Discovery Mode</strong> prioritizes songs you
                  haven't heard in the last 30 days when set above 66%.
                </p>
                <p>
                  Set below 33% to hear more of your favorite tracks mixed with occasional new
                  discoveries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tag Filtering - Regions */}
      <div className="px-6 pb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
              Filter by Region
            </CardTitle>
            <CardDescription>
              Select regions to include in your discovery queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => {
                const isSelected = selectedRegions.includes(region.name);
                return (
                  <Badge
                    key={region.name}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 transition-all ${
                      isSelected
                        ? "border-0 text-zinc-950"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                    style={
                      isSelected
                        ? {
                            background: `linear-gradient(135deg, ${region.flagColors[0]}, ${
                              region.flagColors[1] || region.flagColors[0]
                            })`,
                          }
                        : {}
                    }
                    onClick={() => toggleRegion(region.name)}
                  >
                    {region.name}, {region.country}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              {selectedRegions.length} region{selectedRegions.length !== 1 ? "s" : ""} selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tag Filtering - Genres */}
      <div className="px-6 pb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
              Filter by Genre
            </CardTitle>
            <CardDescription>
              Customize your shuffle by cultural genres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <Badge
                    key={genre}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 transition-all ${
                      isSelected
                        ? "border-0 text-zinc-950"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                    style={isSelected ? { backgroundColor: 'hsl(25 85% 60%)' } : {}}
                    onMouseEnter={(e) => isSelected ? e.currentTarget.style.backgroundColor = 'hsl(25 85% 65%)' : null}
                    onMouseLeave={(e) => isSelected ? e.currentTarget.style.backgroundColor = 'hsl(25 85% 60%)' : null}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""} selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <div className="px-6 pb-6">
        <Card className="border" style={{ 
          background: 'linear-gradient(to bottom right, hsl(25 85% 60% / 0.2), hsl(0 0% 10% / 0.2))',
          borderColor: 'hsl(25 85% 60% / 0.3)'
        }}>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2" style={{ color: 'hsl(25 85% 60%)' }}>Current Configuration</h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                • Discovery level: <strong>{getPriorityLabel()}</strong>
              </p>
              <p>
                • Active regions: <strong>{selectedRegions.length}</strong>
              </p>
              <p>
                • Genre filters: <strong>{selectedGenres.length}</strong>
              </p>
              <p className="text-xs text-zinc-500 mt-3">
                Your settings ensure a non-repetitive experience aligned with your current mood
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}