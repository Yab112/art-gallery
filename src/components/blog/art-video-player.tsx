import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ArtVideoPlayerProps {
  url: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export function ArtVideoPlayer({
  url,
  poster,
  className,
  autoPlay = false,
}: ArtVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  // Format time (MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // YouTube postMessage Helper
  const sendYouTubeCommand = useCallback(
    (func: string, args: any[] = []) => {
      if (isYouTube && iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func,
            args,
          }),
          "*",
        );
      }
    },
    [isYouTube],
  );

  // Control Play/Pause
  const togglePlay = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsPlaying((prev) => !prev);
  }, []);

  // Control Mute
  const toggleMute = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsMuted((prev) => !prev);
  }, []);

  // Handle Replay
  const handleReplay = useCallback(() => {
    if (isYouTube) {
      sendYouTubeCommand("seekTo", [0, true]);
      sendYouTubeCommand("playVideo");
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsPlaying(true);
    setCurrentTime(0);
  }, [isYouTube, sendYouTubeCommand]);

  // Handle Volume Change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
    else setIsMuted(true);

    if (isYouTube) {
      sendYouTubeCommand("setVolume", [newVolume * 100]);
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Handle Seeking
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (isYouTube) {
      sendYouTubeCommand("seekTo", [newTime, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHovering) return; // Only respond when hovering the player

      switch (e.key) {
        case " ":
        case "Enter":
          togglePlay(e);
          break;
        case "m":
        case "M":
          toggleMute(e);
          break;
        case "ArrowRight":
          handleSeek(Math.min(currentTime + 5, duration));
          break;
        case "ArrowLeft":
          handleSeek(Math.max(currentTime - 5, 0));
          break;
        case "ArrowUp":
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "ArrowDown":
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case "r":
        case "R":
          handleReplay();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isHovering,
    togglePlay,
    toggleMute,
    currentTime,
    duration,
    volume,
    handleReplay,
  ]);

  // Sync state with Video Engine
  useEffect(() => {
    if (isYouTube && iframeRef.current && isLoaded) {
      sendYouTubeCommand(isPlaying ? "playVideo" : "pauseVideo");
      sendYouTubeCommand(isMuted ? "mute" : "unMute");
    }
  }, [isPlaying, isMuted, isYouTube, isLoaded, sendYouTubeCommand]);

  // Time Tracking (Simplified for Iframe, real for HTML5)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (!isYouTube && videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          setDuration(videoRef.current.duration);
        } else if (isYouTube && isLoaded) {
          // Request current time from YouTube
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "getCurrentTime",
            }),
            "*",
          );
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({
              event: "command",
              func: "getDuration",
            }),
            "*",
          );
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isYouTube, isLoaded]);

  // Listen for YouTube messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isYouTube) return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "infoDelivery" && data.info) {
          if (data.info.currentTime !== undefined) {
            setCurrentTime(data.info.currentTime);
          }
          if (data.info.duration !== undefined) {
            setDuration(data.info.duration);
          }
        }
      } catch (e) {
        // Not a JSON message or not from YouTube
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isYouTube]);

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className={cn(
        "group relative aspect-video w-full overflow-hidden bg-black shadow-2xl",
        className,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowVolumeSlider(false);
      }}
    >
      {/* Poster / Placeholder */}
      <AnimatePresence>
        {(!isPlaying || !isLoaded) && poster && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <img
              src={poster}
              alt="Video poster"
              className="h-full w-full object-cover grayscale transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/40 transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Engine */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {isYouTube || isVimeo ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop()}?autoplay=${autoPlay ? 1 : 0}&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`}
            className={cn(
              "absolute top-1/2 left-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 pointer-events-none",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setIsLoaded(true)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video Player"
          />
        ) : (
          <video
            ref={videoRef}
            src={url}
            poster={poster}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-1000",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoadedData={() => {
              setIsLoaded(true);
              setDuration(videoRef.current?.duration || 0);
            }}
            onClick={() => togglePlay()}
            loop
            playsInline
            muted={isMuted}
          />
        )}
      </div>

      {/* Custom UI Overlay */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-6 pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-end items-start gap-2 md:gap-3">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            onClick={handleReplay}
            className="pointer-events-auto rounded-full bg-black/60 p-2 md:p-2.5 text-white backdrop-blur-xl hover:bg-red-700 transition-all border border-white/10"
            title="Replay (R)"
          >
            <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" />
          </motion.button>

          <div
            className="relative flex items-center pointer-events-auto"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 100, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden bg-black/60 backdrop-blur-xl rounded-l-full h-8 md:h-10 flex items-center px-3 md:px-4 border-y border-l border-white/10"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className="w-16 md:w-20 accent-red-700 h-1 cursor-pointer"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={toggleMute}
              className={cn(
                "rounded-full bg-black/60 p-2 md:p-2.5 text-white backdrop-blur-xl hover:bg-red-700 transition-all border border-white/10",
                showVolumeSlider && "rounded-l-none",
              )}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={16} className="md:w-[18px] md:h-[18px]" />
              ) : (
                <Volume2 size={16} className="md:w-[18px] md:h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {!isPlaying && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                onClick={() => togglePlay()}
                className="pointer-events-auto flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-red-700 hover:border-red-700 hover:scale-110 shadow-2xl"
              >
                <Play
                  size={28}
                  fill="currentColor"
                  className="ml-1 md:ml-1.5 md:w-[36px] md:h-[36px]"
                />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: isHovering || !isPlaying ? 0 : 20,
            opacity: isHovering || !isPlaying ? 1 : 0,
          }}
          className="pointer-events-auto flex flex-col gap-3 md:gap-4"
        >
          {/* Draggable Progress Bar */}
          <div className="group/progress relative h-1 md:h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-visible">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="absolute inset-y-0 left-0 bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.8)] rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            {/* Seek handle visual */}
            <div
              className="absolute top-1/2 h-3 w-3 md:h-4 md:w-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => togglePlay()}
                className="text-white hover:text-red-500 transition-all transform hover:scale-110"
              >
                {isPlaying ? (
                  <Pause size={18} className="md:w-[22px] md:h-[22px]" />
                ) : (
                  <Play
                    size={18}
                    fill="currentColor"
                    className="md:w-[22px] md:h-[22px]"
                  />
                )}
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    {isPlaying ? "Currently Viewing" : "Playback Paused"}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-mono text-gray-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Art Collection Video
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleFullscreen}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
