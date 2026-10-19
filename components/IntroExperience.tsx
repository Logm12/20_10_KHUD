"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { INTRO_CONFIG, IntroConfig, isIntroActive } from "@/config/intro";

interface IntroExperienceProps {
  config?: IntroConfig;
  onComplete: () => void;
}

type IntroStage = "invite" | "video" | "exiting";

const BUFFERING_WATCHDOG_MS = 14000;

export default function IntroExperience({
  config = INTRO_CONFIG,
  onComplete,
}: IntroExperienceProps) {
  const active = isIntroActive(config);

  const [stage, setStage] = useState<IntroStage>("invite");
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(false);
  const [envelopeReady, setEnvelopeReady] = useState<boolean>(false);

  // Video player states synchronized with HTMLVideoElement events
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playBlocked, setPlayBlocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const primaryInviteBtnRef = useRef<HTMLButtonElement | null>(null);

  // Concurrency and lifecycle guards
  const hasFinishedRef = useRef<boolean>(false);
  const playRequestIdRef = useRef<number>(0);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const startWatchdog = useCallback(() => {
    clearWatchdog();
    watchdogTimerRef.current = setTimeout(() => {
      if (hasFinishedRef.current) return;
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
      setIsBuffering(false);
      setIsPlaying(false);
      setErrorMessage(
        "Kết nối mạng đang chậm hoặc video tải quá lâu. Bạn có thể bấm Thử lại hoặc vào thẳng khu vườn nhé."
      );
    }, BUFFERING_WATCHDOG_MS);
  }, [clearWatchdog]);

  const stopAndCleanupVideo = useCallback(() => {
    clearWatchdog();
    playRequestIdRef.current += 1;
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.muted = true;
        video.removeAttribute("src");
        video.load();
      } catch {
        // Ignore cleanup errors on detached nodes
      }
    }
  }, [clearWatchdog]);

  // Single-fire transition into the garden website
  const finishIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    stopAndCleanupVideo();

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    setStage("exiting");
    exitTimerRef.current = setTimeout(() => {
      onComplete();
    }, 280);
  }, [onComplete, prefersReducedMotion, stopAndCleanupVideo]);

  // Detect prefers-reduced-motion and run gentle 0.9s floral/envelope entrance
  useEffect(() => {
    if (!active) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = mediaQuery.matches;
    setPrefersReducedMotion(reduced);

    if (reduced) {
      setEnvelopeReady(true);
    } else {
      const timer = setTimeout(() => {
        setEnvelopeReady(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [active]);

  // Lock body scroll and focus primary button while intro is open
  useEffect(() => {
    if (!active) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      primaryInviteBtnRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  // Cleanup all timers and media on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      stopAndCleanupVideo();
    };
  }, [stopAndCleanupVideo]);

  // Focus trap inside modal dialog
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, stage, errorMessage, playBlocked]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Initiate video playback directly inside user gesture
  const startVideoPlayback = useCallback(
    async (reloadSource = false) => {
      if (hasFinishedRef.current) return;
      const video = videoRef.current;
      if (!video) return;

      const reqId = ++playRequestIdRef.current;
      setStage("video");
      setErrorMessage(null);
      setPlayBlocked(false);
      setIsBuffering(true);
      startWatchdog();

      try {
        const targetSrc = config.videoUrl.trim();
        if (!video.getAttribute("src") || reloadSource) {
          video.src = targetSrc;
          video.load();
        }

        video.muted = isMuted;
        video.volume = volume;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        if (playRequestIdRef.current !== reqId || hasFinishedRef.current) {
          return;
        }

        clearWatchdog();
        setIsPlaying(!video.paused);
        setIsBuffering(false);
        setPlayBlocked(false);
      } catch (err: unknown) {
        if (playRequestIdRef.current !== reqId || hasFinishedRef.current) {
          return;
        }
        clearWatchdog();
        setIsPlaying(false);
        setIsBuffering(false);

        const errName = err instanceof Error ? err.name : "";
        if (errName === "AbortError") {
          return;
        }
        if (errName === "NotAllowedError") {
          // Browser blocked playback; show direct play button on video stage
          setPlayBlocked(true);
          return;
        }
        if (errName === "NotSupportedError") {
          setErrorMessage(
            "Không thể tải video hoặc định dạng chưa được trình duyệt hỗ trợ."
          );
          return;
        }
        setErrorMessage(
          "Không thể phát video mở đầu lúc này. Bạn có thể thử lại hoặc vào khu vườn nhé."
        );
      }
    },
    [clearWatchdog, config.videoUrl, isMuted, startWatchdog, volume]
  );

  // Toggle play/pause when already in video stage
  const toggleVideoPlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasFinishedRef.current) return;

    if (!video.paused || isPlaying) {
      playRequestIdRef.current += 1;
      clearWatchdog();
      video.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      void startVideoPlayback(false);
    }
  }, [clearWatchdog, isPlaying, startVideoPlayback]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVol = parseFloat(e.target.value);
      setVolume(nextVol);
      const nextMuted = nextVol === 0;
      setIsMuted(nextMuted);
      if (videoRef.current) {
        videoRef.current.volume = nextVol;
        videoRef.current.muted = nextMuted;
      }
    },
    []
  );

  const toggleFullscreen = useCallback(async () => {
    const container = videoContainerRef.current;
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (container?.requestFullscreen) {
        await container.requestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      // Ignore fullscreen permission errors
    }
  }, []);

  if (!active) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Lời nhắn mở đầu The Secret Bloom"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ivory/95 backdrop-blur-md p-3 sm:p-6 transition-opacity ${
        prefersReducedMotion ? "" : "duration-300"
      } ${stage === "exiting" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* Decorative soft floral aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blush/50 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-lavender/40 blur-3xl" />
      </div>

      {/* Stage 1: Invitation Screen */}
      {stage === "invite" && (
        <div
          className={`relative z-10 w-full max-w-md rounded-3xl bg-ivory-100 border border-dusty/30 shadow-letter p-6 sm:p-9 text-center space-y-6 ${
            prefersReducedMotion
              ? ""
              : "transition-all duration-1000 ease-out transform " +
                (envelopeReady
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-90 translate-y-2 scale-[0.98]")
          }`}
        >
          {/* Floral / Envelope Crest */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blush/60 border border-dusty/30 flex items-center justify-center shadow-soft">
            <Mail
              className={`w-8 h-8 sm:w-9 sm:h-9 text-dusty-deep ${
                prefersReducedMotion ? "" : "animate-float"
              }`}
            />
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush/50 text-dusty-deep text-[11px] font-medium tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              <span>The Secret Bloom • 20/10</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-plum font-semibold leading-snug">
              Có một lời nhắn dành cho bạn.
            </h1>

            <p className="text-xs sm:text-sm text-plum/75 font-light leading-relaxed">
              Một đoạn phim nhỏ với âm thanh và lời chúc từ tập thể Khoa Các
              Khoa học Ứng dụng trước khi bạn bước vào khu vườn.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <button
              ref={primaryInviteBtnRef}
              type="button"
              onClick={() => void startVideoPlayback(false)}
              className="w-full py-3.5 px-6 rounded-xl bg-dusty-deep hover:bg-dusty-deeper text-ivory font-medium text-sm shadow-vintage transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-dusty/50"
            >
              <Play className="w-4 h-4 fill-ivory" />
              <span>Xem lời nhắn</span>
            </button>

            {config.allowSkip !== false && (
              <button
                type="button"
                onClick={finishIntro}
                className="w-full py-2 px-4 rounded-xl text-xs sm:text-sm text-plum/75 hover:text-plum hover:bg-blush/35 font-medium transition-colors inline-flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-dusty/40"
              >
                <span>Bỏ qua, vào khu vườn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stage 2: Video Player Container (mounted with preload="none" so user gesture play() works directly) */}
      <div
        ref={videoContainerRef}
        className={`relative z-10 w-full max-w-4xl flex flex-col items-center ${
          stage === "video" ? "block" : "hidden"
        }`}
      >
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-plum-dark/95 border border-dusty/30 shadow-letter flex flex-col">
          {/* Top Bar inside Video Frame */}
          <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3 bg-ivory/95 border-b border-dusty/20 text-plum">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-dusty-deep shrink-0" />
              <span className="font-serif text-xs sm:text-sm font-semibold truncate">
                Lời nhắn mở đầu — The Secret Bloom
              </span>
            </div>

            {config.allowSkip !== false && (
              <button
                type="button"
                onClick={finishIntro}
                aria-label="Bỏ qua, vào khu vườn"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blush/70 hover:bg-blush text-plum text-xs font-medium border border-dusty/30 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
              >
                <span>Bỏ qua, vào khu vườn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Video Viewport — object-contain preserves full aspect ratio (16:9 or 9:16) without cropping */}
          <div className="relative w-full bg-black flex items-center justify-center min-h-[220px] sm:min-h-[360px] max-h-[72vh]">
            <video
              ref={videoRef}
              preload="none"
              playsInline
              loop={false}
              poster={config.posterUrl || undefined}
              onClick={toggleVideoPlayPause}
              onPlay={() => {
                setIsPlaying(true);
                setPlayBlocked(false);
                setErrorMessage(null);
              }}
              onPlaying={() => {
                clearWatchdog();
                setIsPlaying(true);
                setIsBuffering(false);
                setPlayBlocked(false);
                setErrorMessage(null);
              }}
              onPause={() => {
                setIsPlaying(false);
              }}
              onWaiting={() => {
                if (!hasFinishedRef.current) {
                  setIsBuffering(true);
                  startWatchdog();
                }
              }}
              onStalled={() => {
                if (!hasFinishedRef.current && isPlaying) {
                  setIsBuffering(true);
                  startWatchdog();
                }
              }}
              onCanPlay={() => {
                clearWatchdog();
                setIsBuffering(false);
              }}
              onTimeUpdate={() => {
                if (isBuffering) {
                  clearWatchdog();
                  setIsBuffering(false);
                }
              }}
              onVolumeChange={() => {
                const v = videoRef.current;
                if (v) {
                  setIsMuted(v.muted);
                  setVolume(v.volume);
                }
              }}
              onEnded={() => {
                finishIntro();
              }}
              onError={() => {
                if (hasFinishedRef.current || stage !== "video") return;
                clearWatchdog();
                setIsPlaying(false);
                setIsBuffering(false);
                setErrorMessage(
                  "Không thể tải hoặc phát video mở đầu. Bạn có thể bấm Thử lại hoặc vào thẳng khu vườn nhé."
                );
              }}
              className="w-full h-full max-h-[72vh] object-contain cursor-pointer"
            >
              {config.captionsUrl && (
                <track
                  kind="captions"
                  src={config.captionsUrl}
                  srcLang={config.captionsLang || "vi"}
                  label={config.captionsLabel || "Tiếng Việt"}
                  default
                />
              )}
            </video>

            {/* Buffering Indicator (no fake percentage) */}
            {isBuffering && !errorMessage && !playBlocked && (
              <div
                role="status"
                aria-live="polite"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-ivory gap-2 p-4 text-center"
              >
                <Loader2 className="w-8 h-8 animate-spin text-blush" />
                <span className="text-xs sm:text-sm font-medium">
                  Đang tải video...
                </span>
              </div>
            )}

            {/* Direct Play Fallback Button when play() is rejected by browser policy */}
            {playBlocked && !errorMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center gap-3">
                <p className="text-xs sm:text-sm text-ivory/90 max-w-xs">
                  Trình duyệt cần bạn xác nhận thêm một lần để phát video có âm
                  thanh.
                </p>
                <button
                  type="button"
                  onClick={() => void startVideoPlayback(false)}
                  className="px-5 py-3 rounded-xl bg-dusty-deep hover:bg-dusty-deeper text-ivory font-medium text-xs sm:text-sm shadow-vintage inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blush"
                >
                  <Play className="w-4 h-4 fill-ivory" />
                  <span>Bấm để phát video</span>
                </button>
              </div>
            )}

            {/* Error / Stalled Overlay with Retry & Enter Garden actions */}
            {errorMessage && (
              <div
                role="alert"
                className="absolute inset-0 flex flex-col items-center justify-center bg-plum-dark/90 p-5 text-center gap-4 text-ivory"
              >
                <AlertCircle className="w-8 h-8 text-blush shrink-0" />
                <p className="text-xs sm:text-sm max-w-md leading-relaxed">
                  {errorMessage}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void startVideoPlayback(true)}
                    className="px-4 py-2.5 rounded-xl bg-ivory text-plum font-medium text-xs sm:text-sm hover:bg-blush-light transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blush"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Thử lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={finishIntro}
                    className="px-4 py-2.5 rounded-xl bg-dusty-deep hover:bg-dusty-deeper text-ivory font-medium text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blush"
                  >
                    <span>Vào khu vườn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-ivory/95 border-t border-dusty/20 text-plum">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play / Pause */}
              <button
                type="button"
                onClick={toggleVideoPlayPause}
                aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dusty-deep hover:bg-dusty-deeper text-ivory text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/50"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-ivory" />
                    <span>Phát</span>
                  </>
                )}
              </button>

              {/* Mute / Unmute & Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Bật tiếng video" : "Tắt tiếng video"}
                  className="p-1.5 rounded-lg text-plum/80 hover:text-plum hover:bg-blush/50 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-dusty-deep" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-plum" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Âm lượng video"
                  className="w-16 sm:w-24 accent-dusty-deep cursor-pointer"
                />
              </div>
            </div>

            {/* Fullscreen Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label={
                  isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"
                }
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-plum/80 hover:text-plum hover:bg-blush/50 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Toàn màn hình</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
