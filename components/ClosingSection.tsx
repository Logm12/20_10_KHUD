"use client";

import React from "react";
import { Heart } from "lucide-react";
import { HydrangeaIllustration, RoseIllustration, DaisyIllustration, LavenderIllustration } from "./BotanicalDecorations";

export default function ClosingSection() {
  return (
    <footer className="relative py-20 px-4 bg-ivory paper-texture border-t border-dusty/20 overflow-hidden">
      {/* Background floral accents */}
      <div className="absolute -bottom-8 -left-8 opacity-25">
        <HydrangeaIllustration className="w-32 h-32" />
      </div>
      <div className="absolute -bottom-8 -right-8 opacity-25">
        <RoseIllustration className="w-32 h-32" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <DaisyIllustration className="w-8 h-8 opacity-60" />
          <Heart className="w-4 h-4 text-dusty fill-dusty animate-pulse" />
          <LavenderIllustration className="w-8 h-8 opacity-60" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-plum font-semibold">
          Mong những điều tốt đẹp luôn tìm đến bạn.
        </h2>

        <p className="text-base sm:text-lg text-plum/80 font-light max-w-lg mx-auto">
          Chúc một nửa dịu dàng của thế giới ngày 20/10 thật nhiều niềm vui!
        </p>

        <div className="pt-6 border-t border-dusty/15 max-w-xs mx-auto">
          <p className="font-serif italic text-xs tracking-widest text-dusty-dark">
            With love, from our little team • 20.10.2026
          </p>
          <p className="text-[11px] text-plum/50 pt-1">
            Liên chi đoàn Khoa Các Khoa học Ứng dụng — VNU-IS
          </p>
        </div>
      </div>
    </footer>
  );
}
