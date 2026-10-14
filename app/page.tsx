"use client";

import React from "react";
import PetalCanvas from "@/components/PetalCanvas";
import HeroSection from "@/components/HeroSection";
import SecretGiftSection from "@/components/SecretGiftSection";
import KindnessWall from "@/components/KindnessWall";
import ClosingSection from "@/components/ClosingSection";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  const scrollToGift = () => {
    const el = document.getElementById("secret-gift");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen">
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
    </main>
  );
}
