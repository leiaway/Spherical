import { Play, Pause, Volume2, X } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

/**
 * Fixed bottom player bar showing currently playing track with controls.
 * Only visible when a track is actively playing.
 */
export const AudioPlayerBar = () => {
  const { currentTrack, isPlaying, progress, duration, pause, resume, seek, clear } = useAudio();

  if (!currentTrack) return null;

  const handleProgressChange = (values: number[]) => {
    seek(values[0]);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAudio = currentTrack.audio_url;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artist?.name || 'Unknown Artist'}
            </p>
          </div>

          {hasAudio ? (
            <>
              {/* Play/Pause Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => (isPlaying ? pause() : resume())}
                className="flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Progress Bar */}
              <div className="flex-shrink-0 w-32 flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={duration || 100}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume Icon (placeholder) */}
              <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </>
          ) : (
            <div className="text-xs text-muted-foreground">
              Preview unavailable
            </div>
          )}

          {/* Close Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            className="flex-shrink-0"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
