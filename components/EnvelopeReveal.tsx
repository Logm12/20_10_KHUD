"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Copy, Check, RotateCcw, Sparkles, Heart, Crown } from "lucide-react";
import { RecipientPublicGift } from "@/types/recipient";
import { WaxSeal, HydrangeaIllustration, RoseIllustration, DaisyIllustration, LavenderIllustration, TulipIllustration, SunflowerIllustration } from "./BotanicalDecorations";

interface EnvelopeRevealProps {
  gift: RecipientPublicGift;
  onReset: () => void;
}

export default function EnvelopeReveal({ gift, onReset }: EnvelopeRevealProps) {
  // Animation step:
  // 0: Initial closed envelope
  // 1: Shaking / Wobble
  // 2: Seal Glow
  // 3: Flap Opening
  // 4: Letter Rising & Reveal
  const [animStep, setAnimStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<boolean>(false);
  const isSpecialLeader = gift.cardVariant === "SPECIAL_LEADER";

  const triggerConfetti = () => {
    try {
      const colors = isSpecialLeader
        ? ["#D4AF37", "#F7E7CE", "#B76E79", "#FFF9F5"]
        : ["#BE839A", "#F3DCE4", "#D9C7F2", "#B9CEB9", "#FFF9F5"];

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors,
        ticks: 200,
        gravity: 0.8,
        scalar: 1.1,
      });
    } catch {
      // safe fallback if confetti fails
    }
  };

  const startAnimation = React.useCallback(() => {
    setAnimStep(1); // Wobble

    setTimeout(() => {
      setAnimStep(2); // Seal Glow
    }, 700);

    setTimeout(() => {
      setAnimStep(3); // Flap Open
      triggerConfetti();
    }, 1400);

    setTimeout(() => {
      setAnimStep(4); // Letter Rises
    }, 2200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gift.id, isSpecialLeader]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const handleCopyGreeting = () => {
    const textToCopy = `${gift.shortGreeting}\n\n${gift.letter}\n\n— With love, from Liên chi đoàn Khoa Các Khoa học Ứng dụng (20/10/2026)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderFlowerIllustration = () => {
    const flowerLower = gift.flower.toLowerCase();
    if (flowerLower.includes("cẩm tú cầu")) return <HydrangeaIllustration className="w-20 h-20" />;
    if (flowerLower.includes("hồng")) return <RoseIllustration className="w-20 h-20" />;
    if (flowerLower.includes("cúc")) return <DaisyIllustration className="w-20 h-20" />;
    if (flowerLower.includes("lavender") || flowerLower.includes("oải hương")) return <LavenderIllustration className="w-20 h-20" />;
    if (flowerLower.includes("tulip")) return <TulipIllustration className="w-20 h-20" />;
    if (flowerLower.includes("hướng dương")) return <SunflowerIllustration className="w-20 h-20" />;
    return <RoseIllustration className="w-20 h-20" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* 1. Envelope Visual during opening stages (steps 0 to 3) */}
      {animStep < 4 && (
        <div className="flex flex-col items-center justify-center min-h-[420px] transition-all duration-500">
          <div
            className={`relative w-72 sm:w-88 h-48 sm:h-56 rounded-2xl transition-all duration-500 flex items-center justify-center ${
              isSpecialLeader
                ? "bg-gradient-to-br from-gold-champagne via-ivory to-blush border-2 border-gold-warm shadow-gold"
                : "bg-gradient-to-br from-blush/60 via-ivory to-lavender/40 border border-dusty/30 shadow-letter"
            } ${animStep === 1 ? "animate-bounce" : ""}`}
          >
            {/* Envelope Flap */}
            <div
              className={`absolute top-0 inset-x-0 h-24 rounded-t-2xl border-b border-dusty/20 origin-top transition-transform duration-700 flex items-center justify-center ${
                animStep >= 3 ? "scale-y-0 opacity-20" : "scale-y-100"
              } ${isSpecialLeader ? "bg-gold-light/40" : "bg-blush/30"}`}
            >
              <div className="w-0 h-0 border-l-[140px] sm:border-l-[170px] border-l-transparent border-r-[140px] sm:border-r-[170px] border-r-transparent border-t-[80px] sm:border-t-[96px] border-t-dusty/20 absolute -top-1" />
            </div>

            {/* Wax Seal Center */}
            <div
              className={`z-20 transition-all duration-500 ${
                animStep === 2 ? "scale-125 filter drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" : ""
              } ${animStep >= 3 ? "scale-90 opacity-40" : ""}`}
            >
              <WaxSeal variant={gift.cardVariant} />
            </div>

            <div className="absolute bottom-4 text-center font-serif text-sm tracking-wider text-plum/70 italic">
              {animStep < 2 && `Phong thư gửi đến ${gift.displayName}...`}
              {animStep === 2 && "Con dấu đang mở..."}
              {animStep === 3 && "Cánh hoa đang nở..."}
            </div>
          </div>
        </div>
      )}

      {/* 2. Unveiled Personalized Gift Card (animStep === 4) */}
      {animStep === 4 && (
        <div
          className={`relative rounded-3xl p-6 sm:p-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${
            isSpecialLeader
              ? "bg-gradient-to-b from-ivory via-gold-light/30 to-blush/20 gold-border shadow-gold"
              : "bg-ivory vintage-border shadow-letter"
          }`}
        >
          {/* Special Leader Crown Badge */}
          {isSpecialLeader && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-warm text-xs font-semibold tracking-widest uppercase">
                <Crown className="w-3.5 h-3.5 text-gold" />
                The Golden Bloom • Letter of Appreciation
              </span>
            </div>
          )}

          {/* Special Leader Dedicated Quote */}
          {isSpecialLeader && (
            <div className="text-center py-2 mb-6 border-b border-gold/25">
              <p className="font-serif italic text-base sm:text-lg text-gold-rosegold font-medium">
                &ldquo;Gửi Nhật Lệ — Cảm ơn vì đã luôn dành tâm sức cho tập thể.&rdquo;
              </p>
            </div>
          )}

          {/* Recipient Photo & Flower Presentation */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-dusty/20">
            {/* Private Photo Container */}
            <div className="relative group">
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-soft transition-transform group-hover:scale-105 ${
                  isSpecialLeader ? "ring-2 ring-gold/60" : "ring-1 ring-dusty/30"
                }`}
              >
                {!photoError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/api/me/photo"
                    alt={gift.displayName}
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blush/30">
                    {renderFlowerIllustration()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-ivory rounded-full p-1.5 shadow-sm border border-dusty/20">
                <Heart className="w-4 h-4 text-dusty fill-dusty" />
              </div>
            </div>

            {/* Header info */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-plum font-semibold">
                  Gửi {gift.displayName}
                </h2>
                {isSpecialLeader && <Sparkles className="w-5 h-5 text-gold animate-pulse" />}
              </div>

              <div className="text-xs font-medium text-plum/60 tracking-wider">
                {gift.role} • Liên chi đoàn Khoa Các Khoa học Ứng dụng
              </div>

              {/* Flower tag */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush/60 text-dusty-dark text-xs font-medium border border-dusty/20">
                  <span className="w-2 h-2 rounded-full bg-dusty" />
                  Hoa đại diện: {gift.flower}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-lavender/40 text-plum-light text-xs font-medium border border-lavender">
                  {gift.theme}
                </span>
              </div>
            </div>
          </div>

          {/* Flower Symbolism Meaning */}
          <div className="py-4 my-2 px-4 rounded-xl bg-blush/20 border border-blush text-center sm:text-left">
            <span className="text-xs font-semibold text-dusty-dark uppercase tracking-wider block mb-0.5">
              Ý nghĩa loài hoa
            </span>
            <p className="text-xs sm:text-sm text-plum/80 italic font-serif">
              {gift.meaning}
            </p>
          </div>

          {/* Short Greeting Quote */}
          <div className="my-5 p-4 rounded-2xl bg-ivory-200 border-l-4 border-dusty text-plum font-serif italic text-sm sm:text-base leading-relaxed">
            &ldquo;{gift.shortGreeting}&rdquo;
          </div>

          {/* The Personalized Letter Body */}
          <div className="space-y-4 text-plum/90 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line text-justify font-sans">
            {gift.letter}
          </div>

          {/* Signature & Collective Team */}
          <div className="mt-8 pt-6 border-t border-dusty/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-0.5">
              <div className="font-serif italic text-xs text-dusty-dark tracking-wide">
                With sincere love and best wishes,
              </div>
              <div className="text-xs font-medium text-plum/70">
                Liên chi đoàn Khoa Các Khoa học Ứng dụng • VNU-IS
              </div>
              <div className="text-[11px] text-plum/50">
                Ngày 20 tháng 10 năm 2026
              </div>
            </div>

            {/* Action Buttons: Copy Greeting & Replay Animation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyGreeting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ivory border border-dusty/30 hover:bg-blush/30 text-plum text-xs font-medium shadow-sm transition-all"
                title="Sao chép lời chúc"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-sage-dark" />
                    <span className="text-sage-dark font-semibold">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-dusty" />
                    <span>Sao chép lời chúc</span>
                  </>
                )}
              </button>

              <button
                onClick={startAnimation}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ivory border border-dusty/30 hover:bg-blush/30 text-plum text-xs font-medium shadow-sm transition-all"
                title="Xem lại hiệu ứng mở thư"
              >
                <RotateCcw className="w-3.5 h-3.5 text-dusty" />
                <span className="hidden sm:inline">Mở lại thư</span>
              </button>

              <button
                onClick={onReset}
                className="inline-flex items-center px-3 py-2 rounded-xl text-plum/60 hover:text-plum text-xs transition-colors"
                title="Nhập người khác"
              >
                Đổi người
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
