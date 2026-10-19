"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PetalCanvas from "@/components/PetalCanvas";
import HeroSection from "@/components/HeroSection";
import SecretGiftSection from "@/components/SecretGiftSection";
import KindnessWall from "@/components/KindnessWall";
import ClosingSection from "@/components/ClosingSection";
import AudioPlayer from "@/components/AudioPlayer";
import IntroExperience from "@/components/IntroExperience";
import { INTRO_CONFIG, isIntroActive } from "@/config/intro";

export default function Home() {
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(() =>
    isIntroActive(INTRO_CONFIG)
  );
  const mainContainerRef = useRef<HTMLDivElement | null>(null);

  const handleIntroComplete = useCallback(() => {
    setIsIntroOpen(false);
    // Restore focus to the main garden view after intro closes
    requestAnimationFrame(() => {
      const container = mainContainerRef.current;
      if (!container) return;
      const primaryHeadingOrCta = container.querySelector<HTMLElement>(
        "button, a[href], h1, [tabindex='0']"
      );
      if (primaryHeadingOrCta) {
        primaryHeadingOrCta.focus({ preventScroll: true });
      }
    });
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && isIntroActive(INTRO_CONFIG)) {
        setIsIntroOpen(true);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Synchronize HTML inert attribute on the background wrapper while intro is open
  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;
    if (isIntroOpen) {
      container.setAttribute("inert", "");
    } else {
      container.removeAttribute("inert");
    }
  }, [isIntroOpen]);

  const scrollToGift = () => {
    const el = document.getElementById("secret-gift");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen">
      {isIntroOpen && (
        <IntroExperience config={INTRO_CONFIG} onComplete={handleIntroComplete} />
      )}

      <div
        ref={mainContainerRef}
        aria-hidden={isIntroOpen}
        className={
          isIntroOpen ? "pointer-events-none select-none" : undefined
        }
      >
        {/* Falling Petals Background */}
        <PetalCanvas />

        {/* Section A: Hero Landing */}
        <HeroSection onScrollToGift={scrollToGift} />

        {/* Section B & C: Secret Gift & Envelope Reveal */}
        <SecretGiftSection />

        {/* Section D: Wall of Kindness */}
        <KindnessWall />

        {/* Section E: Closing */}
        <ClosingSection />

        {/* Optional User-Toggled Audio Player */}
        <AudioPlayer />
      </div>
    </main>
  );
}

