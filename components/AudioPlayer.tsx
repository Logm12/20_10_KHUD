"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
  ChevronDown,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Volume2,
} from "lucide-react";
import {
  MUSIC_PLAYLIST,
  MusicTrack,
  getNextTrackIndex,
  getPrevTrackIndex,
} from "@/config/music";

interface AudioPlayerProps {
  playlist?: MusicTrack[];
}

export default function AudioPlayer({
  playlist = MUSIC_PLAYLIST,
}: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelToggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstPanelControlRef = useRef<HTMLButtonElement | null>(null);

  // Track whether user has explicitly initiated a listening session
  const hasUserStartedRef = useRef<boolean>(false);
  // Track whether a track change should automatically start playback
  const shouldPlayAfterSwitchRef = useRef<boolean>(false);
  // Guard against overlapping play() promises on rapid clicks
  const isPlayRequestPendingRef = useRef<boolean>(false);
  const playRequestIdRef = useRef<number>(0);

  const safeIndex =
    playlist.length > 0 ? Math.min(currentIndex, playlist.length - 1) : 0;
  const currentTrack: MusicTrack | undefined = playlist[safeIndex];
  const hasMultipleTracks = playlist.length >= 2;

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const requestId = ++playRequestIdRef.current;
    isPlayRequestPendingRef.current = true;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      if (playRequestIdRef.current !== requestId) return;
      setIsPlaying(!audio.paused);
      setIsLoading(false);
    } catch (err: unknown) {
      if (playRequestIdRef.current !== requestId) return;
      setIsPlaying(false);
      setIsLoading(false);

      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "AbortError") {
        // Interrupted by pause() or track switch; not a user-facing error
        return;
      }
      if (errorName === "NotAllowedError") {
        setErrorMessage(
          "Trình duyệt chưa cho phép phát nhạc. Bạn hãy bấm Thử lại nhé."
        );
      } else if (errorName === "NotSupportedError") {
        setErrorMessage(
          "Không thể tải hoặc định dạng nhạc không được hỗ trợ."
        );
      } else {
        setErrorMessage("Không thể phát bài nhạc này. Vui lòng thử lại.");
      }
    } finally {
      if (playRequestIdRef.current === requestId) {
        isPlayRequestPendingRef.current = false;
      }
    }
  }, [currentTrack]);

  // Toggle Play / Pause (resumes from current position when paused)
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Ignore duplicate rapid play clicks while play() is already initiating
    if (isPlayRequestPendingRef.current) {
      playRequestIdRef.current += 1;
      isPlayRequestPendingRef.current = false;
      shouldPlayAfterSwitchRef.current = false;
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    if (!audio.paused || isPlaying) {
      playRequestIdRef.current += 1;
      shouldPlayAfterSwitchRef.current = false;
      audio.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      hasUserStartedRef.current = true;
      void attemptPlay();
    }
  }, [attemptPlay, currentTrack, isPlaying]);

  // Switch to a specific track index
  const selectTrack = useCallback(
    (targetIndex: number) => {
      if (playlist.length === 0) return;
      const normalizedIndex =
        ((targetIndex % playlist.length) + playlist.length) % playlist.length;

      if (normalizedIndex === safeIndex) {
        return;
      }

      const audio = audioRef.current;
      const wasPlaying = Boolean(
        isPlaying ||
          (audio && !audio.paused) ||
          isPlayRequestPendingRef.current ||
          shouldPlayAfterSwitchRef.current
      );

      playRequestIdRef.current += 1;
      isPlayRequestPendingRef.current = false;
      setErrorMessage(null);

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      shouldPlayAfterSwitchRef.current = wasPlaying;
      setIsLoading(wasPlaying);
      setCurrentIndex(normalizedIndex);
    },
    [isPlaying, playlist.length, safeIndex]
  );

  const handlePrevTrack = useCallback(() => {
    if (!hasMultipleTracks) return;
    const prevIdx = getPrevTrackIndex(safeIndex, playlist.length);
    selectTrack(prevIdx);
  }, [hasMultipleTracks, playlist.length, safeIndex, selectTrack]);

  const handleNextTrack = useCallback(() => {
    if (!hasMultipleTracks) return;
    const nextIdx = getNextTrackIndex(safeIndex, playlist.length);
    selectTrack(nextIdx);
  }, [hasMultipleTracks, playlist.length, safeIndex, selectTrack]);

  const handleRetry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    hasUserStartedRef.current = true;
    setErrorMessage(null);
    audio.load();
    void attemptPlay();
  }, [attemptPlay, currentTrack]);

  // Handle track index change: start from 0, play only if previously playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.currentTime = 0;

    if (shouldPlayAfterSwitchRef.current && hasUserStartedRef.current) {
      shouldPlayAfterSwitchRef.current = false;
      audio.load();
      void attemptPlay();
    } else {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [safeIndex, currentTrack, attemptPlay]);

  // Attach and clean up HTMLAudioElement event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      setErrorMessage(null);
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setErrorMessage(null);
    };

    const onPause = () => {
      if (!shouldPlayAfterSwitchRef.current) {
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    const onWaiting = () => {
      if (!audio.paused) {
        setIsLoading(true);
      }
    };

    const onCanPlay = () => {
      setIsLoading(false);
    };

    const onEnded = () => {
      // Only auto-continue if user explicitly started the listening session
      if (!hasUserStartedRef.current) {
        setIsPlaying(false);
        return;
      }

      if (playlist.length === 1) {
        audio.currentTime = 0;
        void attemptPlay();
      } else if (playlist.length > 1) {
        const nextIdx = getNextTrackIndex(safeIndex, playlist.length);
        shouldPlayAfterSwitchRef.current = true;
        setCurrentIndex(nextIdx);
      }
    };

    const onError = () => {
      shouldPlayAfterSwitchRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);

      const mediaError = audio.error;
      if (mediaError?.code === 2) {
        setErrorMessage("Lỗi mạng khi tải nhạc. Vui lòng thử lại.");
      } else if (mediaError?.code === 3 || mediaError?.code === 4) {
        setErrorMessage(
          "Không thể tải bài nhạc hoặc định dạng không được hỗ trợ."
        );
      } else {
        setErrorMessage("Không thể phát bài nhạc này. Vui lòng thử lại.");
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [attemptPlay, playlist.length, safeIndex]);

  // Cleanup audio on component unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Close panel on Escape key and manage focus
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsPanelOpen(false);
        panelToggleBtnRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPanelOpen]);

  // Move focus into panel when opened via keyboard
  const togglePanel = () => {
    setIsPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          firstPanelControlRef.current?.focus();
        }, 20);
      }
      return next;
    });
  };

  if (!currentTrack) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end"
    >
      {/* Single HTMLAudioElement instance — preload="none" prevents downloading before user interaction */}
      <audio ref={audioRef} src={currentTrack.src} preload="none" />

      {/* Expandable Vintage Playlist Panel */}
      {isPanelOpen && (
        <div
          id="bloom-music-panel"
          role="dialog"
          aria-label="Bảng điều khiển nhạc nền"
          className="mb-2.5 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-ivory/95 backdrop-blur-md border border-dusty/30 shadow-letter p-3.5 text-plum transition-all duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-dusty/15">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-dusty-dark" />
              <span className="font-serif text-xs font-semibold tracking-wide text-plum">
                Giai điệu khu vườn
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPanelOpen(false);
                panelToggleBtnRef.current?.focus();
              }}
              aria-label="Đóng bảng chọn nhạc"
              className="p-1 rounded-full text-plum/60 hover:text-plum hover:bg-blush/50 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Track Status */}
          <div className="mb-3 px-2.5 py-2 rounded-xl bg-blush-light/80 border border-dusty/15 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-plum/60 font-sans">
                {isLoading
                  ? "Đang tải nhạc..."
                  : isPlaying
                  ? "Đang phát"
                  : errorMessage
                  ? "Tạm gián đoạn"
                  : "Đang tạm dừng"}
              </p>
              <p className="font-serif text-sm font-semibold text-plum truncate">
                {currentTrack.title}
              </p>
            </div>

            {/* Playback Controls inside Panel */}
            <div className="flex items-center gap-1 shrink-0">
              {hasMultipleTracks && (
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  aria-label="Bài trước"
                  title="Bài trước"
                  className="p-1.5 rounded-full text-plum/75 hover:text-plum hover:bg-blush/60 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                ref={firstPanelControlRef}
                type="button"
                onClick={togglePlayPause}
                aria-label={
                  isPlaying
                    ? `Tạm dừng bài ${currentTrack.title}`
                    : `Phát bài ${currentTrack.title}`
                }
                aria-pressed={isPlaying}
                className="p-2 rounded-full bg-dusty text-ivory hover:bg-dusty-dark shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>

              {hasMultipleTracks && (
                <button
                  type="button"
                  onClick={handleNextTrack}
                  aria-label="Bài tiếp theo"
                  title="Bài tiếp theo"
                  className="p-1.5 rounded-full text-plum/75 hover:text-plum hover:bg-blush/60 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Error Notice & Retry Action */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-3 px-2.5 py-2 rounded-xl bg-blush/70 border border-dusty/40 text-xs text-plum flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="w-3.5 h-3.5 text-dusty-deep shrink-0" />
                <span className="text-[11px] leading-snug">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                aria-label="Thử phát lại bài nhạc"
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-ivory text-plum font-medium text-[11px] border border-dusty/30 hover:bg-blush-light transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {/* Playlist Track Selector (only shown when 2+ tracks exist) */}
          {hasMultipleTracks && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-plum/60 px-1">
                Danh sách bài hát ({playlist.length})
              </p>
              <ul
                className="space-y-1 max-h-36 overflow-y-auto pr-0.5"
                aria-label="Danh sách nhạc nền"
              >
                {playlist.map((track, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <li key={track.id}>
                      <button
                        type="button"
                        onClick={() => selectTrack(idx)}
                        aria-current={isSelected ? "true" : undefined}
                        aria-label={`Chọn bài ${track.title}${
                          isSelected
                            ? isPlaying
                              ? " (đang phát)"
                              : " (đang chọn)"
                            : ""
                        }`}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40 ${
                          isSelected
                            ? "bg-blush/80 text-plum font-semibold border border-dusty/30"
                            : "text-plum/75 hover:bg-blush/35 hover:text-plum"
                        }`}
                      >
                        <span className="truncate">
                          {idx + 1}. {track.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ivory/90 text-dusty-deep font-medium shrink-0">
                            {isPlaying ? "Đang phát" : "Đang chọn"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Compact Error Pill when Panel is Closed */}
      {!isPanelOpen && errorMessage && (
        <div
          role="alert"
          className="mb-1.5 px-3 py-1.5 rounded-full bg-ivory/95 border border-dusty/40 shadow-vintage flex items-center gap-2 text-[11px] text-plum max-w-[calc(100vw-1.5rem)]"
        >
          <AlertCircle className="w-3.5 h-3.5 text-dusty-deep shrink-0" />
          <span className="truncate">{errorMessage}</span>
          <button
            type="button"
            onClick={handleRetry}
            aria-label="Thử phát lại nhạc"
            className="shrink-0 font-semibold text-dusty-deep underline hover:text-plum"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Compact Floating Control Bar at Bottom-Right */}
      <div
        className={`flex items-center rounded-full border shadow-vintage backdrop-blur-md transition-all duration-300 text-xs font-medium ${
          isPlaying
            ? "bg-blush/90 text-plum border-dusty/40"
            : "bg-ivory/90 text-plum/80 border-dusty/25"
        }`}
      >
        {/* Main Play / Pause Toggle Button */}
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={
            isPlaying
              ? `Tạm dừng nhạc nền: ${currentTrack.title}`
              : `Phát nhạc nền: ${currentTrack.title}`
          }
          aria-pressed={isPlaying}
          title={
            isPlaying
              ? `Tạm dừng: ${currentTrack.title}`
              : `Phát nhạc: ${currentTrack.title}`
          }
          className="flex items-center gap-2 pl-3.5 pr-2.5 py-2 rounded-l-full hover:text-plum transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-dusty-dark animate-spin" />
          ) : isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-dusty-dark animate-pulse" />
          ) : (
            <Play className="w-3.5 h-3.5 text-dusty-dark" />
          )}

          <span className="max-w-[110px] sm:max-w-[150px] truncate">
            {isPlaying ? currentTrack.title : "Bật nhạc nền"}
          </span>
        </button>

        {/* Quick Next Track Button on Desktop when 2+ tracks exist */}
        {hasMultipleTracks && (
          <button
            type="button"
            onClick={handleNextTrack}
            aria-label="Chuyển bài tiếp theo"
            title="Bài tiếp theo"
            className="hidden sm:inline-flex items-center justify-center p-2 text-plum/70 hover:text-plum border-l border-dusty/20 transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        )}

        {/* Expand / Collapse Playlist Panel Button */}
        <button
          ref={panelToggleBtnRef}
          type="button"
          onClick={togglePanel}
          aria-expanded={isPanelOpen}
          aria-controls="bloom-music-panel"
          aria-label={
            isPanelOpen ? "Thu gọn bảng chọn nhạc" : "Mở bảng chọn nhạc"
          }
          title={isPanelOpen ? "Thu gọn bảng nhạc" : "Danh sách nhạc nền"}
          className="flex items-center justify-center pl-2 pr-3 py-2 rounded-r-full border-l border-dusty/20 text-plum/70 hover:text-plum transition-colors focus:outline-none focus:ring-2 focus:ring-dusty/40"
        >
          {isPanelOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-dusty-dark" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-dusty-dark" />
          )}
        </button>
      </div>
    </div>
  );
}
