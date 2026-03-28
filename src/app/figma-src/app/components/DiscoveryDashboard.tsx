import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { artists, regionalTrending } from "../lib/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function DiscoveryDashboard() {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  
  // Frequency Freshness Data
  const freshnessData = [
    { name: "New Songs", value: 68, color: "hsl(25 85% 60%)" },
    { name: "Familiar", value: 32, color: "#3f3f46" },
  ];

  return (
    <div className="min-h-screen pb-24 bg-zinc-950">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl mb-2">Discovery Dashboard</h1>
        <p className="text-zinc-400">Break out of your taste bubble</p>
      </header>

      {/* Frequency Freshness Indicator */}
      <div className="px-6 pb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
              Freshness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={freshnessData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {freshnessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1">
                <div className="text-4xl mb-1" style={{ color: 'hsl(25 85% 60%)' }}>68%</div>
                <p className="text-sm text-zinc-400 mb-3">
                  of your current playlist consists of songs you've never heard before
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(25 85% 60%)' }} />
                    <span className="text-zinc-300">New discoveries</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-zinc-600" />
                    <span className="text-zinc-300">Familiar tracks</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emerging Artists Carousel */}
      <div className="pb-6">
        <div className="px-6 mb-4">
          <h2 className="text-xl mb-1">Emerging Artists</h2>
          <p className="text-sm text-zinc-400">Authentic voices from around the world</p>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-4 px-6 pb-2">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="w-64 bg-zinc-900/70 border-zinc-800 transition-all cursor-pointer overflow-hidden group" 
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(25 85% 60% / 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}>
                  <div className="relative">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {artist.badge && (
                      <Badge className="absolute top-3 left-3 text-zinc-950 border-0" style={{ backgroundColor: 'hsl(25 85% 60%)' }}>
                        {artist.badge}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-1">{artist.name}</h3>
                    <p className="text-sm text-zinc-400 mb-2">{artist.genre}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3" />
                      <span>{artist.region.name}, {artist.region.country}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Regional Trending Map */}
      <div className="px-6 pb-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
              Regional Hotspots
            </CardTitle>
            <p className="text-sm text-zinc-400">
              Where this genre is trending right now
            </p>
          </CardHeader>
          <CardContent>
            {/* Simplified map visualization */}
            <div className="relative h-64 bg-zinc-800/50 rounded-lg overflow-hidden">
              {/* Map background with grid */}
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }} />
              
              {/* Hotspot markers */}
              {regionalTrending.map((location, index) => {
                const x = ((location.lng + 180) / 360) * 100;
                const y = ((90 - location.lat) / 180) * 100;
                
                return (
                  <motion.div
                    key={location.region}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setSelectedHotspot(location.region)}
                  >
                    <motion.div
                      className="relative"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `hsl(25 85% 60% / ${location.hotness / 100})`,
                          boxShadow: `0 0 20px hsl(25 85% 60% / ${location.hotness / 100})`,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Hotspot List */}
            <div className="mt-4 space-y-2">
              {regionalTrending.map((location) => (
                <div
                  key={location.region}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                    selectedHotspot === location.region
                      ? 'border'
                      : 'bg-zinc-800/30 hover:bg-zinc-800/50'
                  }`}
                  style={selectedHotspot === location.region ? {
                    backgroundColor: 'hsl(25 85% 60% / 0.2)',
                    borderColor: 'hsl(25 85% 60% / 0.3)'
                  } : {}}
                  onClick={() => setSelectedHotspot(location.region)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{location.region}</p>
                    <Progress value={location.hotness} className="h-1 mt-2" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium" style={{ color: 'hsl(25 85% 60%)' }}>
                      {location.hotness}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}