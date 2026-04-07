import React, { useEffect, useRef, useState } from "react";
import { ReactHlsPlayer, type ReactHlsPlayerRef } from "@im03/react-hls-player";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReactHlsPlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(true);
  const [levels, setLevels] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = () => {
      setProgress(video.currentTime);
      setDuration(video.duration || 0);

      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    };

    video.addEventListener("timeupdate", update);
    video.addEventListener("progress", update);
    video.addEventListener("loadedmetadata", update);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("progress", update);
      video.removeEventListener("loadedmetadata", update);
    };
  }, []);

  const togglePlay = () => {
    if (playing) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !muted;
    setMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    playerRef.current?.seek(time);
    setProgress(time);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);

    const video = videoRef.current;
    if (!video) return;

    video.volume = v;
    video.muted = v === 0;
    setMuted(video.muted);
  };

  const handleQuality = (level: number) => {
    setCurrentLevel(level);
    playerRef.current?.setQuality(level);
  };

  const toggleFullScreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          React HLS Player
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          @im03/react-hls-player
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden group shadow-2xl"
      >
        <ReactHlsPlayer
          src="http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8"
          ref={playerRef}
          playerRef={videoRef}
          controls={false}
          className="w-full"
          autoPlay={false}
          muted={true}
          poster="https://upload.wikimedia.org/wikipedia/commons/7/7c/Aspect_ratio_16_9_example.jpg"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLevelsLoaded={(levels) => {
            setLevels(levels);
            setCurrentLevel(-1);
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
          <div className="relative w-full h-1.5 mb-4">
            <div className="absolute inset-0 bg-white/20 rounded-full" />

            <div
              className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
              style={{
                width: `${duration ? (buffered / duration) * 100 : 0}%`,
              }}
            />

            <div
              className="absolute inset-y-0 left-0 bg-red-500 rounded-full"
              style={{
                width: `${duration ? (progress / duration) * 100 : 0}%`,
              }}
            />

            <input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="hover:scale-110 transition"
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute}>
                  {muted ? (
                    <VolumeX size={18} className="opacity-80" />
                  ) : (
                    <Volume2 size={18} className="opacity-80" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolume}
                  className="w-20 accent-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={currentLevel}
                onChange={(e) => handleQuality(Number(e.target.value))}
                className="bg-black/60 backdrop-blur px-2 py-1 rounded-md text-white outline-none"
              >
                <option value={-1}>Auto</option>
                {levels.map((lvl, i) => (
                  <option value={i} key={i}>
                    {lvl}
                  </option>
                ))}
              </select>

              <button
                onClick={toggleFullScreen}
                className="hover:scale-110 transition"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
