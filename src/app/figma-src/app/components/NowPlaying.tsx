import { useState } from "react";
import { motion } from "motion/react";
import { Globe, Info, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { currentSong, culturalMetadata } from "../lib/mockData";

export function NowPlaying() {
  const [discoveryMode, setDiscoveryMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45); // Progress percentage

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header Section */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: 'hsl(25 85% 60%)' }} />
            <div>
              <p className="text-xs text-zinc-400">Listening in:</p>
              <p className="font-medium" style={{ color: currentSong.artist.region.flagColors[0] }}>
                {currentSong.artist.region.name}, {currentSong.artist.region.country}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Album Art with Pulsing Border */}
      <div className="px-6 py-8">
        <div className="relative max-w-md mx-auto">
          {discoveryMode && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentSong.artist.region.flagColors[0]}, ${currentSong.artist.region.flagColors[1] || currentSong.artist.region.flagColors[0]})`,
                filter: "blur(20px)",
                opacity: 0.6,
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          <div className={`relative rounded-2xl overflow-hidden ${discoveryMode ? "ring-2 ring-offset-4 ring-offset-zinc-950" : ""}`}
               style={discoveryMode ? { ringColor: currentSong.artist.region.flagColors[0] } : {}}>
            <img
              src={currentSong.coverUrl}
              alt={currentSong.album}
              className="w-full aspect-square object-cover"
            />
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-2xl mb-1">{currentSong.title}</h1>
              <p className="text-zinc-400">{currentSong.artist.name}</p>
              <p className="text-sm text-zinc-500">{currentSong.album}</p>
            </div>
            
            {/* Cultural Metadata Drawer */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400" style={{ ['--hover-color' as string]: 'hsl(25 85% 60%)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(25 85% 60%)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                  <Info className="w-5 h-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-zinc-900 border-zinc-800">
                <DrawerHeader>
                  <DrawerTitle style={{ color: 'hsl(25 85% 60%)' }}>Cultural Context</DrawerTitle>
                </DrawerHeader>
                <div className="px-6 pb-8 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Music Genre History</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {culturalMetadata.genreHistory}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Artist Origins</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {culturalMetadata.artistOrigin}
                    </p>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {currentSong.artist.isEmerging && (
            <Badge style={{ backgroundColor: 'hsl(25 85% 60% / 0.2)', borderColor: 'hsl(25 85% 60% / 0.3)', color: '#a347d2' }}>
              {currentSong.artist.badge}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: currentSong.artist.region.flagColors[0] }}
              initial={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>2:03</span>
            <span>{currentSong.duration}</span>
          </div>
        </div>
      </div>

      {/* Discovery Mode Toggle */}
      <div className="px-6 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${discoveryMode ? 'bg-zinc-800' : 'bg-zinc-800'}`} style={discoveryMode ? { backgroundColor: 'hsl(25 85% 60% / 0.2)' } : {}}>
                <Globe className={`w-5 h-5 ${discoveryMode ? '' : 'text-zinc-500'}`} style={discoveryMode ? { color: 'hsl(25 85% 60%)' } : {}} />
              </div>
              <div>
                <p className="font-medium">Discovery Mode</p>
                <p className="text-xs text-zinc-500">Prioritize emerging artists</p>
              </div>
            </div>
            <Switch
              checked={discoveryMode}
              onCheckedChange={setDiscoveryMode}
              style={discoveryMode ? { backgroundColor: 'hsl(25 85% 60%)' } : {}}
            />
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <Repeat className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              size="icon"
              className="w-16 h-16 rounded-full text-zinc-950"
              style={{ backgroundColor: 'hsl(25 85% 60%)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(25 85% 65%)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(25 85% 60%)'}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <SkipForward className="w-6 h-6" />
            </Button>
            
            {/* Refreshed Shuffle with Badge */}
            <div className="relative">
              <Button variant="ghost" size="icon" style={{ color: 'hsl(25 85% 60%)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(25 85% 65%)'} onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(25 85% 60%)'}>
                <Shuffle className="w-5 h-5" />
              </Button>
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-950 rounded-full" style={{ backgroundColor: 'hsl(25 85% 60%)' }}>
                Fresh
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}