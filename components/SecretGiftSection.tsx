"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import GiftUnlockForm from "./GiftUnlockForm";
import EnvelopeReveal from "./EnvelopeReveal";
import { RecipientPublicGift } from "@/types/recipient";
import { Mail, Sparkles } from "lucide-react";

type SessionResetState = "resetting" | "ready" | "error";

export default function SecretGiftSection() {
  // Always start with activeGift = null; never auto-restore previous gift on reload
  const [activeGift, setActiveGift] = useState<RecipientPublicGift | null>(
    null
  );
  const [sessionResetState, setSessionResetState] =
    useState<SessionResetState>("resetting");
  const [formResetKey, setFormResetKey] = useState<number>(0);

  const isMountedRef = useRef<boolean>(true);
  // Monotonic counter for reset requests to handle Strict Mode and concurrent calls
  const resetRequestIdRef = useRef<number>(0);
  // Monotonic counter incremented on any unlock so a late reset never wipes a newly issued session
  const unlockGenerationRef = useRef<number>(0);

  const runSessionReset = useCallback(async () => {
    const reqId = ++resetRequestIdRef.current;
    const generationAtStart = unlockGenerationRef.current;

    setActiveGift(null);
    setSessionResetState("resetting");

    try {
      const res = await fetch("/api/me/reset", {
        method: "POST",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (
        !isMountedRef.current ||
        resetRequestIdRef.current !== reqId ||
        unlockGenerationRef.current !== generationAtStart
      ) {
        return;
      }

      if (res.ok && data.success !== false) {
        setSessionResetState("ready");
      } else {
        setSessionResetState("error");
      }
    } catch {
      if (
        !isMountedRef.current ||
        resetRequestIdRef.current !== reqId ||
        unlockGenerationRef.current !== generationAtStart
      ) {
        return;
      }
      setSessionResetState("error");
    }
  }, []);

  // Reset session on initial mount and handle Back/Forward cache (bfcache)
  useEffect(() => {
    isMountedRef.current = true;
    void runSessionReset();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Restored from browser bfcache: clear any stale gift UI & reset session
        unlockGenerationRef.current += 1;
        setActiveGift(null);
        setFormResetKey((prev) => prev + 1);
        void runSessionReset();
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Clear gift state before browser snapshots DOM into bfcache
        setActiveGift(null);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [runSessionReset]);

  const handleUnlockSuccess = useCallback((gift: RecipientPublicGift) => {
    // Advance generation so any stale in-flight reset is ignored
    unlockGenerationRef.current += 1;
    resetRequestIdRef.current += 1;
    setSessionResetState("ready");
    setActiveGift(gift);
  }, []);

  // Explicit server-side session termination on "Đổi người / Xem lại"
  const handleResetSession = useCallback(async () => {
    unlockGenerationRef.current += 1;
    setActiveGift(null);
    setFormResetKey((prev) => prev + 1);
    await runSessionReset();
  }, [runSessionReset]);

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
              Nhập tên và ngày sinh nhé. Một món quà nhỏ đang chờ đúng người đến
              nhận.
            </p>

            <GiftUnlockForm
              key={formResetKey}
              onUnlockSuccess={handleUnlockSuccess}
              isSessionReady={sessionResetState === "ready"}
              isSessionResetting={sessionResetState === "resetting"}
              sessionResetError={sessionResetState === "error"}
              onRetrySessionReset={() => void runSessionReset()}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sage-light text-plum text-xs font-medium border border-sage uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
              <span>MÓN QUÀ ĐÃ ĐƯỢC MỞ</span>
            </div>

            <EnvelopeReveal gift={activeGift} onReset={handleResetSession} />
          </div>
        )}
      </div>
    </section>
  );
}
