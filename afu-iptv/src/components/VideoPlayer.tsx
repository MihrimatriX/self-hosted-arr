"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Volume2, VolumeX, Maximize, Minimize, Play, Pause, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
// HLS.js will be loaded dynamically

const isDev = process.env.NODE_ENV !== "production";
const devLog = (...args: unknown[]) => { if (isDev) console.log(...args); };

interface VideoPlayerProps {
  streamUrl: string;
  channelName: string;
  isOpen: boolean;
  onClose: () => void;
  isEmbedded?: boolean;
}

export function VideoPlayer({ streamUrl, channelName, isOpen, onClose, isEmbedded = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ESC tuşu ile kapatma (sadece embedded değilse)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isEmbedded) {
        onClose();
      } else if (event.key === " " && isOpen) {
        event.preventDefault();
        handlePlayPause();
      } else if (event.key === "f" && isOpen) {
        event.preventDefault();
        handleFullscreen();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      if (!isEmbedded) {
      document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (!isEmbedded) {
      document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose, isEmbedded]);

  // HLS stream yükleme
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const video = videoRef.current;
    let hls: any = null;

    const loadStream = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Dynamic import of HLS.js
        const Hls = (await import("hls.js")).default;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 5,
            debug: false,
          });

          hlsRef.current = hls;

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            devLog("HLS: Media attached");
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            devLog("HLS: Manifest parsed");
            setIsLoading(false);
            setHasError(false);
          });

          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            devLog("HLS Error:", data);
            if (data.fatal) {
              setIsLoading(false);
              setHasError(true);
            }
          });

          hls.attachMedia(video);
          hls.loadSource(streamUrl);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS support
          video.src = streamUrl;
          setIsLoading(false);
        } else {
          throw new Error("HLS desteklenmiyor");
        }
      } catch (error) {
        devLog("Stream yükleme hatası:", error);
        setIsLoading(false);
        setHasError(true);
      }
    };

    loadStream();

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, streamUrl]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
    };
  }, [isOpen]);

  // Kontrolleri otomatik gizle
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    resetControlsTimeout();
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
    resetControlsTimeout();
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = 0.8;
      setVolume(0.8);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
    resetControlsTimeout();
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
      document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
    resetControlsTimeout();
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    resetControlsTimeout();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    video.currentTime = newTime;
  };

  if (!isOpen) return null;

  const videoContent = isEmbedded ? (
    <div className="h-full w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
      {/* Video Container */}
      <div 
        className="relative w-full max-w-full bg-black"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          crossOrigin="anonymous"
          style={{ backgroundColor: '#000' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary/20" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">Yayın Yükleniyor</p>
                <p className="text-sm text-slate-300 mt-1">Lütfen bekleyin...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 text-center max-w-md mx-4">
              <div className="relative">
                <div className="rounded-full bg-red-500/20 p-6">
                  <X className="h-12 w-12 text-red-400" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Yayın Yüklenemedi</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bu kanal şu anda erişilebilir değil veya geçici bir sorun var. Lütfen daha sonra tekrar deneyin.
                </p>
              </div>
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/80 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={clsx(
            "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-white bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                  CANLI
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white truncate max-w-xs">{channelName}</h2>
            </div>
            
            {/* Audio Control */}
            <button
              onClick={handleMuteToggle}
              className="rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              title={isMuted ? "Sesi aç" : "Sesi kapat"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="p-4">
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={handleRestart}
                  className="rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFullscreen}
                  className="rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                  title="Tam ekran (F)"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <div className="w-full px-4">
        <div className="relative mx-auto w-full max-w-5xl aspect-video">
          {/* Video Container */}
          <div 
            className="absolute inset-0 bg-black rounded-2xl overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              if (isPlaying) {
                setShowControls(false);
              }
            }}
          >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
            style={{ backgroundColor: '#000' }}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary/20" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">Yayın Yükleniyor</p>
                  <p className="text-sm text-slate-300 mt-1">Lütfen bekleyin...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-6 text-center max-w-md mx-4">
                <div className="relative">
                  <div className="rounded-full bg-red-500/20 p-6">
                    <X className="h-12 w-12 text-red-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Yayın Yüklenemedi</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bu kanal şu anda erişilebilir değil veya geçici bir sorun var. Lütfen daha sonra tekrar deneyin.
                  </p>
                </div>
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/80 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tekrar Dene
                </button>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={clsx(
              "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Top Controls */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                  <span className="text-sm font-medium text-white bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                    CANLI
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white truncate max-w-md">{channelName}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="p-6">
              {/* Progress Bar */}
              <div 
                className="mb-6 h-2 w-full cursor-pointer rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                onClick={handleSeek}
              >
                <div 
                  className="h-full rounded-full bg-primary transition-all shadow-lg shadow-primary/50"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="rounded-xl bg-black/60 p-4 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7" />
                    ) : (
                      <Play className="h-7 w-7" />
                    )}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="rounded-xl bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMuteToggle}
                      className="rounded-xl bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFullscreen}
                    className="rounded-xl bg-black/60 p-3 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
                      title="Tam ekran (F)"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );

  if (isEmbedded) {
    return videoContent;
  }

  if (typeof window === "undefined") return null;
  return createPortal(videoContent, document.body);
}
