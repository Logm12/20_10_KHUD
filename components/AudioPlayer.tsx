"use client";

import React, { useState, useEffect, useRef } from "react";
import { Music, VolumeX, Volume2 } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Soft pentatonic soothing chime melody generator using Web Audio API
  const playChime = (ctx: AudioContext, freq: number, delay: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + delay + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  const playSequence = (ctx: AudioContext) => {
    // E major pentatonic relaxing chime frequencies (E4, F#4, G#4, B4, C#5, E5)
    const notes = [329.63, 369.99, 415.3, 493.88, 554.37, 659.25];
    const sequence = [
      { note: notes[0], delay: 0 },
      { note: notes[2], delay: 0.6 },
      { note: notes[3], delay: 1.2 },
      { note: notes[4], delay: 2.0 },
      { note: notes[1], delay: 2.8 },
      { note: notes[5], delay: 3.6 },
    ];

    sequence.forEach((s) => {
      playChime(ctx, s.note, s.delay, 2.5);
    });
  };

  const toggleMusic = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    } else {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      playSequence(ctx);

      intervalRef.current = setInterval(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === "running") {
          playSequence(audioCtxRef.current);
        }
      }, 5500);

      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={toggleMusic}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-vintage backdrop-blur-md transition-all duration-300 text-xs font-medium ${
          isPlaying
            ? "bg-blush/90 text-plum border-dusty/40"
            : "bg-ivory/80 text-plum/70 hover:text-plum border-dusty/20"
        }`}
        title={isPlaying ? "Tắt giai điệu" : "Bật giai điệu nhẹ nhàng"}
        aria-label="Toggle soothing background melody"
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-dusty animate-pulse" />
            <span className="hidden sm:inline">Giai điệu dịu êm</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-plum/50" />
            <span className="hidden sm:inline">Bật nhạc nền</span>
          </>
        )}
        <Music className="w-3 h-3 text-dusty" />
      </button>
    </div>
  );
}
