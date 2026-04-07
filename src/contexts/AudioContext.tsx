import { createContext, useContext, useRef, useState, useEffect } from 'react';
import type { Track } from '@/hooks/useRegions';

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
  youtubeVideoId: string | null;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  clear: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  // Play a new track
  const play = (track: Track) => {
    console.log('[AudioContext] play() called:', { id: track.id, title: track.title, audio_url: track.audio_url });
    // If clicking the same track that's playing, toggle pause
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        setYoutubeVideoId(null);
      } else {
        const ytId = track.audio_url ? extractYouTubeId(track.audio_url) : null;
        if (ytId) {
          setYoutubeVideoId(ytId);
          setIsPlaying(true);
        } else if (track.audio_url && audioRef.current) {
          audioRef.current.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      }
      return;
    }

    // New track
    audioRef.current?.pause();
    setCurrentTrack(track);
    setProgress(0);
    setYoutubeVideoId(null);

    if (!track.audio_url) {
      setIsPlaying(false);
      return;
    }

    const ytId = extractYouTubeId(track.audio_url);
    if (ytId) {
      setYoutubeVideoId(ytId);
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setYoutubeVideoId(null);
  };

  const resume = () => {
    if (!currentTrack?.audio_url) return;
    const ytId = extractYouTubeId(currentTrack.audio_url);
    if (ytId) {
      setYoutubeVideoId(ytId);
      setIsPlaying(true);
    } else if (audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
    }
  };

  const clear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setYoutubeVideoId(null);
  };

  // Update progress on timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => { setIsPlaying(false); setProgress(0); };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, duration, youtubeVideoId, play, pause, resume, seek, clear }}>
      {children}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
