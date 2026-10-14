"use client";

import React from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { HydrangeaIllustration, RoseIllustration, DaisyIllustration, LavenderIllustration } from "./BotanicalDecorations";

interface HeroSectionProps {
  onScrollToGift: () => void;
}

export default function HeroSection({ onScrollToGift }: HeroSectionProps) {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-16 sm:py-24 overflow-hidden paper-texture">
      {/* Decorative Botanical Corner SVGs */}
      <div className="absolute top-8 left-4 md:left-12 opacity-40 hover:opacity-80 transition-opacity">
        <HydrangeaIllustration className="w-20 h-20 md:w-32 md:h-32 text-dusty transform -rotate-12" />
      </div>
      <div className="absolute top-12 right-4 md:right-12 opacity-40 hover:opacity-80 transition-opacity">
        <RoseIllustration className="w-20 h-20 md:w-28 md:h-28 text-dusty transform rotate-12" />
      </div>
      <div className="absolute bottom-16 left-6 md:left-20 opacity-30">
        <LavenderIllustration className="w-16 h-16 md:w-24 md:h-24 text-lavender-dark" />
      </div>
      <div className="absolute bottom-16 right-6 md:right-20 opacity-30">
        <DaisyIllustration className="w-16 h-16 md:w-24 md:h-24 text-dusty" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush/60 border border-dusty/20 text-dusty-dark text-xs sm:text-sm font-medium tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-dusty" />
          <span>HAPPY VIETNAMESE WOMEN&apos;S DAY • 20.10.2026</span>
          <Sparkles className="w-3.5 h-3.5 text-dusty" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-plum leading-tight tracking-tight">
          Hôm nay, có một điều <br className="hidden sm:inline" />
          <span className="italic font-normal text-dusty-dark">dễ thương</span> dành cho bạn.
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl mx-auto text-base sm:text-lg text-plum/80 leading-relaxed font-light">
          Một chút hoa, một lời chúc và một món quà nhỏ được chuẩn bị riêng. Biết đâu hôm nay bạn sẽ tìm thấy điều khiến mình mỉm cười?
        </p>

        {/* CTA Button */}
        <div className="pt-6">
          <button
            onClick={onScrollToGift}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-dusty-deep text-ivory font-medium shadow-vintage hover:bg-dusty-deeper transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="tracking-wide">Khám phá món quà của mình</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>

        {/* Subtext info */}
        <div className="pt-8 text-xs text-plum/50 tracking-wider">
          Dành tặng các bạn nữ Liên chi đoàn Khoa Các Khoa học Ứng dụng • VNU-IS
        </div>
      </div>
    </section>
  );
}
