import { useState } from 'react';
import { TrackCard } from './TrackCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useMoodPlaylist, useFestivalPlaylist } from '@/hooks/useMoodPlaylist';
import { useFestivals, type Region, type Festival } from '@/hooks/useRegions';

/** Requirement: F1.6 (playlists reflecting local mood or festivals). See docs/REQUIREMENTS_REFERENCE.md */

const MOODS = [
  { value: 'festive',     label: 'Festive',     emoji: '🎉' },
  { value: 'chill',       label: 'Chill',       emoji: '😌' },
  { value: 'energetic',   label: 'Energetic',   emoji: '⚡' },
  { value: 'melancholic', label: 'Melancholic', emoji: '🌧️' },
  { value: 'spiritual',   label: 'Spiritual',   emoji: '✨' },
  { value: 'romantic',    label: 'Romantic',    emoji: '💫' },
  { value: 'protest',     label: 'Protest',     emoji: '✊' },
];

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

interface FestivalRowProps {
  festival: Festival;
}

const FestivalRow = ({ festival }: FestivalRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const { data: tracks, isLoading } = useFestivalPlaylist(expanded ? festival.id : null);

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{festival.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {festival.typical_month && (
                <span className="text-xs text-muted-foreground">
                  {MONTH_NAMES[festival.typical_month - 1]}
                </span>
              )}
              {festival.mood && (
                <Badge variant="secondary" className="text-xs py-0">
                  {festival.mood}
                </Badge>
              )}
              {festival.genre && (
                <Badge variant="outline" className="text-xs py-0">
                  {festival.genre.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-3 space-y-3">
          {festival.description && (
            <p className="text-xs text-muted-foreground">{festival.description}</p>
          )}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : tracks && tracks.length > 0 ? (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No tracks tagged for this festival yet
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface MoodPlaylistPanelProps {
  region: Region;
  onPlay?: (trackId: string) => void;
}

/**
 * Discovery tab panel: mood chip selectors + festival cards for a region.
 * Selecting a mood loads a playlist of matching tracks. Each festival card
 * expands inline to show its generated playlist.
 */
export const MoodPlaylistPanel = ({ region, onPlay }: MoodPlaylistPanelProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { data: moodTracks, isLoading: moodLoading } = useMoodPlaylist(region.id, selectedMood);
  const { data: festivals, isLoading: festivalsLoading } = useFestivals(region.id);

  return (
    <div className="space-y-6">
      {/* Mood Selector */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Browse by Mood</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedMood === m.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <span>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="pt-2">
            {moodLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : moodTracks && moodTracks.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {moodTracks.length} track{moodTracks.length !== 1 ? 's' : ''} tagged as{' '}
                  <span className="font-medium">{selectedMood}</span> in {region.name}
                </p>
                {moodTracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index} onPlay={onPlay} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  No {selectedMood} tracks in {region.name} yet
                </p>
                <p className="text-xs mt-1 opacity-70">
                  Upload a track and tag it with this mood
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Festivals */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Local Festivals & Events</p>
        {festivalsLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : festivals && festivals.length > 0 ? (
          <div className="space-y-2">
            {festivals.map((festival) => (
              <FestivalRow key={festival.id} festival={festival} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No festivals listed for {region.name} yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
