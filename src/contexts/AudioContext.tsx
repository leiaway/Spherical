import { createContext, useContext, useRef, useState, useEffect } from 'react';
import type { Track } from '@/hooks/useRegions';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
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

  // Play a new track
  const play = (track: Track) => {
    if (!audioRef.current) return;

    // If clicking the same track that's playing, toggle pause
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (track.audio_url) {
          audioRef.current.play().catch(() => {
            // Playback failed, keep state consistent
            setIsPlaying(false);
          });
          setIsPlaying(true);
        }
      }
      return;
    }

    // New track - always set it, even if no audio_url
    setCurrentTrack(track);
    setProgress(0);

    // Only try to play if there's an audio URL
    if (track.audio_url) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(() => {
        // Playback failed
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (currentTrack?.audio_url && audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
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
  };

  // Update progress on timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

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
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, duration, play, pause, resume, seek, clear }}>
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
