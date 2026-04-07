declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    events?: {
      onReady?: (event: Event) => void;
      onError?: (event: ErrorEvent) => void;
      onStateChange?: (event: StateChangeEvent) => void;
    };
  }

  interface Event {
    target: Player;
  }

  interface StateChangeEvent extends Event {
    data: PlayerState;
  }

  interface ErrorEvent extends Event {
    data: number;
  }

  class Player {
    constructor(element: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    loadVideoById(videoId: string): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): PlayerState;
  }
}

interface Window {
  onYouTubeIframeAPIReady?: () => void;
  YT?: typeof YT;
}
