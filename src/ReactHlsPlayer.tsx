import React, { RefObject, useEffect } from "react";
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

export interface ReactHlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  playerRef?: RefObject<HTMLVideoElement>;
  hlsConfig?: HlsConfig;
  autoPlay?: boolean;
  muted?: boolean;
  poster?: string;
  className?: string;
}

const ReactHlsPlayer: React.FC<ReactHlsPlayerProps> = ({
  src,
  playerRef = React.createRef<HTMLVideoElement>(),
  hlsConfig,
  autoPlay = false,
  muted = true,
  poster,
  className = "",
  ...props
}) => {
  useEffect(() => {
    let hls: Hls;

    const initPlayer = () => {
      if (!playerRef.current) return;

      if (hls) hls.destroy();

      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        ...hlsConfig,
      });

      hls.attachMedia(playerRef.current);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            playerRef.current
              ?.play()
              .catch(() =>
                console.warn(
                  "Autoplay blocked. User interaction required to start video.",
                ),
              );
          }
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              initPlayer();
              break;
          }
        }
      });
    };

    if (Hls.isSupported()) {
      initPlayer();
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, autoPlay, hlsConfig, playerRef]);

  return (
    <video
      ref={playerRef}
      src={!Hls.isSupported() ? src : undefined}
      autoPlay={autoPlay}
      muted={muted}
      poster={poster}
      controls
      className={`react-hls-player ${className}`}
      {...props}
    />
  );
};

export default ReactHlsPlayer;
