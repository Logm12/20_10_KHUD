"use client";

import React, { useState, useEffect } from "react";
import GiftUnlockForm from "./GiftUnlockForm";
import EnvelopeReveal from "./EnvelopeReveal";
import { RecipientPublicGift } from "@/types/recipient";
import { Mail, Sparkles } from "lucide-react";

export default function SecretGiftSection() {
  const [activeGift, setActiveGift] = useState<RecipientPublicGift | null>(null);

  // Restore active gift if session cookie exists
  useEffect(() => {
    fetch("/api/me/gift")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.gift) {
          setActiveGift(data.gift);
        }
      })
      .catch(() => {});
  }, []);

  // A13: Explicit server-side session termination on "Đổi người"
  const handleResetSession = async () => {
    try {
      await fetch("/api/me/reset", { method: "POST" });
    } catch (e) {
      console.warn("Failed to reset session cookie:", e);
    }
    setActiveGift(null);
  };

  return (
    <section id="secret-gift" className="relative py-20 px-4 scroll-mt-6">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        {!activeGift ? (
          <>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blush/60 text-dusty-dark text-xs font-medium border border-dusty/20 uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5" />
              <span>THE SECRET GIFT</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-plum font-semibold">
              Có một phong thư mang tên bạn.
            </h2>

            <p className="max-w-md mx-auto text-sm sm:text-base text-plum/70 font-light pb-4">
              Nhập tên và ngày sinh nhé. Một món quà nhỏ đang chờ đúng người đến nhận.
            </p>

            <GiftUnlockForm onUnlockSuccess={(gift) => setActiveGift(gift)} />
          </>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sage-light text-plum text-xs font-medium border border-sage uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
              <span>MÓN QUÀ ĐÃ ĐƯỢC MỞ</span>
            </div>

            <EnvelopeReveal
              gift={activeGift}
              onReset={handleResetSession}
            />
          </div>
        )}
      </div>
    </section>
  );
}
