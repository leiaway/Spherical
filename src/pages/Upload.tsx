import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radio,
  ArrowLeft,
  Youtube,
  MapPin,
  Music2,
  Loader2,
  Mic2,
  Sparkles,
  Globe,
  Tag,
} from "lucide-react";
import { useTrackUpload } from "@/hooks/useTrackUpload";
import { useRegions, useGenres } from "@/hooks/useRegions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

/**
 * F9.1 — Artist Song Upload page with "Tiny Desk" aesthetic.
 * Features YouTube URL input, mandatory location & genre tags for regional discovery.
 */

const MOODS = [
  { value: "energetic", label: "🔥 Energetic" },
  { value: "chill", label: "🌊 Chill" },
  { value: "melancholic", label: "🌧️ Melancholic" },
  { value: "festive", label: "🎉 Festive" },
  { value: "spiritual", label: "✨ Spiritual" },
  { value: "romantic", label: "💜 Romantic" },
  { value: "protest", label: "✊ Protest" },
];

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/;

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/
  );
  return match ? match[1] : null;
}

const Upload = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { upload } = useTrackUpload();
  const { data: regions } = useRegions();
  const { data: genres } = useGenres();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [regionId, setRegionId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [mood, setMood] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const lastFetchedId = useRef<string | null>(null);

  const youtubeId = extractYouTubeId(youtubeUrl);
  const isValidYoutube = youtubeUrl === "" || YOUTUBE_REGEX.test(youtubeUrl);

  // Auto-populate from YouTube metadata
  const fetchYouTubeMetadata = useCallback(
    async (url: string) => {
      const id = extractYouTubeId(url);
      if (!id || id === lastFetchedId.current) return;
      lastFetchedId.current = id;
      setFetchingMeta(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "youtube-metadata",
          { body: { videoId: id } }
        );
        if (!error && data) {
          if (data.title && !title) setTitle(data.title);
          if ((data.artist || data.channelName) && !artistName)
            setArtistName(data.artist || data.channelName);
        }
      } catch {
        // silent — user can still fill fields manually
      } finally {
        setFetchingMeta(false);
      }
    },
    [title, artistName]
  );

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value);
    if (YOUTUBE_REGEX.test(value)) {
      fetchYouTubeMetadata(value);
    }
  };
  const canSubmit =
    title.trim() &&
    artistName.trim() &&
    regionId &&
    genreId &&
    isValidYoutube &&
    !upload.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await upload.mutateAsync({
        title,
        artistName,
        regionId,
        genreId,
        mood: mood || undefined,
        culturalContext: culturalContext || undefined,
        youtubeUrl: youtubeUrl || undefined,
      });

      toast({
        title: "Track submitted! 🎶",
        description:
          "Your track is now tagged and discoverable in its region.",
      });

      // Reset form
      setTitle("");
      setArtistName("");
      setYoutubeUrl("");
      setRegionId("");
      setGenreId("");
      setMood("");
      setCulturalContext("");
    } catch {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <Mic2 className="w-16 h-16 text-primary/60" />
        <h2 className="text-2xl font-bold text-foreground text-center">
          Sign in to share your sound
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Join Frequency to upload tracks and connect with listeners around the
          world.
        </p>
        <Link to="/auth">
          <Button className="gap-2">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Warm ambient header — Tiny Desk inspired */}
      <header className="relative border-b border-border overflow-hidden">
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(25_85%_60%/0.12),transparent_60%)]" />

        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground tracking-wide">
                FREQUENCY
              </span>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Mic2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Share Your Sound
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tiny Desk, global stage — tag it, map it, let it be found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* YouTube URL — hero input */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-foreground">
                YouTube Link
              </h2>
              <Badge variant="secondary" className="text-xs">
                Recommended
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Paste a YouTube URL and we'll embed your performance right into
              discovery feeds.
            </p>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`text-base h-12 ${
                youtubeUrl && !isValidYoutube
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }`}
            />
            {youtubeUrl && !isValidYoutube && (
              <p className="text-xs text-destructive">
                Please enter a valid YouTube URL
              </p>
            )}

            {/* Live YouTube preview */}
            {youtubeId && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </section>

          {/* Track details */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Music2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Track Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="upload-title" className="text-sm font-medium">
                  Track Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="upload-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunset in Lagos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-artist" className="text-sm font-medium">
                  Artist Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="upload-artist"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Your artist or band name"
                  required
                />
              </div>
            </div>
          </section>

          {/* Mandatory Tags — Location & Genre (F10) */}
          <section className="rounded-2xl border-2 border-primary/30 bg-card p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <Tag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Discovery Tags
              </h2>
              <Badge className="bg-primary/15 text-primary border-0 text-xs">
                Required
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              These tags map your track to the right listeners. Region and genre
              are mandatory for regional discovery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Region */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  Region <span className="text-destructive">*</span>
                </Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where is this music from?" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        <span className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                          {r.name} — {r.country}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Music2 className="w-3.5 h-3.5 text-accent" />
                  Genre <span className="text-destructive">*</span>
                </Label>
                <Select value={genreId} onValueChange={setGenreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
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
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Mood
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="How does this track feel?" />
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
          </section>

          {/* Cultural Context */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">
                Cultural Context
              </h2>
              <span className="text-xs text-muted-foreground">(optional)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Share the story, tradition, or inspiration behind this track.
              This helps listeners connect with its roots.
            </p>
            <Textarea
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="e.g. This song draws from Yoruba praise traditions, blending talking drum patterns with contemporary Afrobeat production…"
              rows={4}
              className="resize-none"
            />
          </section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Required fields must
              be filled to submit
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="gap-2 min-w-[160px]"
              >
                {upload.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic2 className="w-4 h-4" />
                )}
                {upload.isPending ? "Submitting…" : "Submit Track"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Upload;
