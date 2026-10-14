"use client";

import React from "react";
import { Heart, Sparkles } from "lucide-react";

interface KindnessCard {
  id: number;
  quote: string;
  author: string;
  tilt: string;
  stickerBg: string;
}

const CARDS: KindnessCard[] = [
  {
    id: 1,
    quote: "Chúc bạn luôn có những điều thật vui để mong chờ.",
    author: "Góc bình yên",
    tilt: "-rotate-1",
    stickerBg: "bg-blush",
  },
  {
    id: 2,
    quote: "Mong mọi dự định nhỏ của bạn dần trở thành hiện thực.",
    author: "Lời nhắn gửi",
    tilt: "rotate-2",
    stickerBg: "bg-lavender",
  },
  {
    id: 3,
    quote: "Cứ là chính mình thôi, thế đã rất tuyệt rồi.",
    author: "Bạn đồng hành",
    tilt: "-rotate-2",
    stickerBg: "bg-sage",
  },
  {
    id: 4,
    quote: "Chúc bạn đủ tự tin để thử những điều mới.",
    author: "Động lực mỗi ngày",
    tilt: "rotate-1",
    stickerBg: "bg-gold-champagne",
  },
  {
    id: 5,
    quote: "Nhớ dành chút thời gian nghỉ ngơi và chăm sóc bản thân nhé.",
    author: "Yêu thương chính mình",
    tilt: "-rotate-1",
    stickerBg: "bg-blush",
  },
  {
    id: 6,
    quote: "Mong hôm nay có một điều gì đó khiến bạn bật cười.",
    author: "Nụ cười 20/10",
    tilt: "rotate-2",
    stickerBg: "bg-lavender",
  },
];

export default function KindnessWall() {
  return (
    <section className="py-20 px-4 bg-blush/20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-ivory text-dusty-dark text-xs font-medium border border-dusty/20 uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 fill-dusty text-dusty" />
            <span>WALL OF KINDNESS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-plum font-semibold">
            Những mảnh ghép yêu thương
          </h2>

          <p className="max-w-md mx-auto text-sm sm:text-base text-plum/70 font-light">
            Gửi chút dịu dàng vào những tấm thiệp nhỏ, như một lời nhắc nhở rằng bạn luôn được yêu quý và trân trọng.
          </p>
        </div>

        {/* Polaroid Scrapbook Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className={`relative bg-ivory p-6 rounded-2xl vintage-border shadow-letter transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5 hover:rotate-0 transform ${card.tilt}`}
            >
              {/* Tape sticker at top */}
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm opacity-80 shadow-sm border border-black/5 ${card.stickerBg}`}
              />

              <div className="pt-2 flex flex-col justify-between h-44">
                <p className="font-serif italic text-base text-plum/90 leading-relaxed text-center my-auto">
                  &ldquo;{card.quote}&rdquo;
                </p>

                <div className="pt-4 border-t border-dusty/15 flex items-center justify-between text-xs text-plum/60">
                  <span className="font-medium tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-dusty" />
                    {card.author}
                  </span>
                  <span className="italic">#20.10.2026</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
