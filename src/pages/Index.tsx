import { useState, useEffect } from "react";
import { RegionCard } from "@/components/RegionCard";
import { RegionSelector } from "@/components/RegionSelector";
import { regions, getRandomRegion, getRegionById } from "@/data/regions";
import { Radio } from "lucide-react";
import heroGlobe from "@/assets/hero-globe.jpg";

const Index = () => {
  const [currentRegionId, setCurrentRegionId] = useState<string>("");
  
  useEffect(() => {
    // Place user in random region on load
    const randomRegion = getRandomRegion();
    setCurrentRegionId(randomRegion.id);
  }, []);

  const currentRegion = getRegionById(currentRegionId);

  const handleRandomRegion = () => {
    const randomRegion = getRandomRegion();
    setCurrentRegionId(randomRegion.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroGlobe})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Radio className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              FREQUENCY
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Break free from algorithms. Explore authentic music from every corner of the world.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Current Region Display */}
        {currentRegion && (
          <section className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Your Current Frequency</h2>
              <p className="text-muted-foreground">
                You've landed in <span className="text-primary font-semibold">{currentRegion.region}</span>
              </p>
            </div>
            
            <RegionCard
              region={currentRegion.region}
              country={currentRegion.country}
              tracks={currentRegion.tracks}
              description={currentRegion.description}
              isActive={true}
            />
          </section>
        )}

        {/* Region Selector */}
        <section className="max-w-6xl mx-auto space-y-6">
          <RegionSelector
            regions={regions.map(r => ({ id: r.id, name: r.region, country: r.country }))}
            currentRegion={currentRegionId}
            onRegionChange={setCurrentRegionId}
            onRandomRegion={handleRandomRegion}
          />
        </section>

        {/* Other Regions Grid */}
        <section className="max-w-7xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Explore More Frequencies
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions
              .filter(r => r.id !== currentRegionId)
              .map(region => (
                <RegionCard
                  key={region.id}
                  region={region.region}
                  country={region.country}
                  tracks={region.tracks}
                  description={region.description}
                  onExplore={() => setCurrentRegionId(region.id)}
                />
              ))}
          </div>
        </section>
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
