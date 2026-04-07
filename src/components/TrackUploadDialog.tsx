import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { useTrackUpload } from '@/hooks/useTrackUpload';
import { useRegions, useGenres } from '@/hooks/useRegions';
import { useToast } from '@/hooks/use-toast';

/** Requirement: F1.4 (tag songs with location and genre to be discovered locally). See docs/REQUIREMENTS_REFERENCE.md */

const MOODS = [
  { value: 'energetic', label: 'Energetic' },
  { value: 'chill', label: 'Chill' },
  { value: 'melancholic', label: 'Melancholic' },
  { value: 'festive', label: 'Festive' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'protest', label: 'Protest' },
];

interface TrackUploadDialogProps {
  regionId?: string | null;
}

/**
 * Dialog for artists to tag and submit a track with region, genre, mood, and cultural context.
 * Pre-fills the region from the current region in view.
 */
export const TrackUploadDialog = ({ regionId }: TrackUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState(regionId ?? '');
  const [genreId, setGenreId] = useState('');
  const [mood, setMood] = useState('');
  const [culturalContext, setCulturalContext] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const { upload } = useTrackUpload();
  const { data: regions } = useRegions();
  const { data: genres } = useGenres();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artistName.trim() || !selectedRegionId || !genreId) return;

    try {
      await upload.mutateAsync({
        title,
        artistName,
        regionId: selectedRegionId,
        genreId,
        mood: mood || undefined,
        culturalContext: culturalContext || undefined,
        audioUrl: audioUrl || undefined,
      });

      toast({ title: 'Track uploaded!', description: 'Your track is now discoverable locally.' });
      setTitle('');
      setArtistName('');
      setSelectedRegionId(regionId ?? '');
      setGenreId('');
      setMood('');
      setCulturalContext('');
      setAudioUrl('');
      setOpen(false);
    } catch {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const canSubmit = title.trim() && artistName.trim() && selectedRegionId && genreId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full">
          <Upload className="w-4 h-4" />
          Upload a Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Upload a Track</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Track Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter track title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistName">Artist Name</Label>
            <Input
              id="artistName"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your artist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                {regions?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} — {r.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {regionId && selectedRegionId === regionId && (
              <p className="text-xs text-muted-foreground">Auto-set to your current region</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Genre</Label>
            <Select value={genreId} onValueChange={setGenreId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mood (optional)</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="culturalContext">Cultural Context (optional)</Label>
            <Textarea
              id="culturalContext"
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="Describe the cultural significance or story behind this track…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL (optional)</Label>
            <Input
              id="audioUrl"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://…"
              type="url"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || upload.isPending}>
              {upload.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Upload Track
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
