import React, {
  forwardRef,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import Hls from "hls.js";

export type HlsConfig = Partial<{
  autoStartLoad: boolean;
  startPosition: number;
  debug: boolean;
  enableWorker: boolean;
  lowLatencyMode: boolean;
  maxBufferLength: number;
  maxMaxBufferLength: number;
  maxBufferSize: number;
  capLevelToPlayerSize: boolean;
  abrEwmaFastLive: number;
  abrEwmaSlowLive: number;
  abrEwmaFastVoD: number;
  abrEwmaSlowVoD: number;
  enableCEA708Captions: boolean;
  enableWebVTT: boolean;
}>;

export type PlayerPreset = "performance" | "balanced" | "quality";

export interface ReactHlsPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQuality: (level: number) => void;
}

export interface ReactHlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  playerRef?: RefObject<HTMLVideoElement | null>;
  hlsConfig?: HlsConfig;
  preset?: PlayerPreset;

  autoPlay?: boolean;
  muted?: boolean;
  poster?: string;
  className?: string;

  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  onLevelsLoaded?: (levels: string[]) => void;
}

const RESOLUTION_BRACKETS: { maxHeight: number; label: string }[] = [
  { maxHeight: 180, label: "144p" },
  { maxHeight: 270, label: "240p" },
  { maxHeight: 390, label: "360p" },
  { maxHeight: 510, label: "480p" },
  { maxHeight: 630, label: "540p" },
  { maxHeight: 790, label: "720p" },
  { maxHeight: 1100, label: "1080p" },
  { maxHeight: 1500, label: "1440p" },
  { maxHeight: Infinity, label: "4K" },
];

function toResolutionLabel(height: number): string {
  if (!height || height <= 0) return "Auto";
  const match = RESOLUTION_BRACKETS.find((r) => height <= r.maxHeight);
  return match?.label ?? `${height}p`;
}

const PRESETS: Record<PlayerPreset, HlsConfig> = {
  performance: {
    maxBufferLength: 10,
    maxMaxBufferLength: 20,
  },
  balanced: {},
  quality: {
    maxBufferLength: 60,
    maxMaxBufferLength: 120,
  },
};

const ReactHlsPlayer = forwardRef<ReactHlsPlayerRef, ReactHlsPlayerProps>(
  (props, ref) => {
    const {
      src,
      playerRef,
      hlsConfig,
      preset = "balanced",
      autoPlay = false,
      muted = true,
      poster,
      className = "",

      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onLevelsLoaded,

      ...rest
    } = props;

    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = playerRef || internalVideoRef;

    const hlsRef = useRef<Hls | null>(null);
    const retryCount = useRef(0);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) videoRef.current.currentTime = time;
      },
      setVolume: (v: number) => {
        if (videoRef.current) videoRef.current.volume = v;
      },
      setQuality: (level: number) => {
        if (hlsRef.current) {
          hlsRef.current.currentLevel = level;
        }
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      let hls: Hls;

      const setupNativeHls = () => {
        video.src = src;
      };

      const initHls = () => {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          ...PRESETS[preset],
          ...hlsConfig,
        });

        hlsRef.current = hls;

        hls.attachMedia(video);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const rawHeights = data.levels.map((level) => level.height);
          const labels = rawHeights.map(toResolutionLabel);

          retryCount.current = 0;

          onReady?.();
          onLevelsLoaded?.(labels);

          if (autoPlay) {
            video.play().catch(() => {
              console.warn("Autoplay blocked.");
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          onError?.(data);

          if (!data.fatal) return;

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCount.current < 3) {
                  retryCount.current++;
                  setTimeout(() => {
                    hls.startLoad();
                  }, 1000 * retryCount.current);
                }
                break;

              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;

              default:
                hls.destroy();
                initHls();
                break;
            }
          }
        });
      };

      if (Hls.isSupported()) {
        initHls();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        setupNativeHls();
      }

      const handlePlay = () => onPlay?.();
      const handlePause = () => onPause?.();
      const handleEnded = () => onEnded?.();

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);

        hls?.destroy();
        hlsRef.current = null;
      };
    }, [src, preset, hlsConfig]);

    return (
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        poster={poster}
        controls={props.controls ?? false}
        className={`react-hls-player w-full rounded-xl bg-black ${className}`}
        {...rest}
      />
    );
  },
);

export default ReactHlsPlayer;
