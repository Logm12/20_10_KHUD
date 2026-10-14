import React from "react";

export function HydrangeaIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Central stem */}
        <path d="M50 95 C 50 75, 48 55, 50 40" stroke="#98B598" strokeWidth="2" />
        <path d="M49 70 C 40 65, 30 68, 25 75 C 32 80, 42 78, 49 73" fill="#B9CEB9" fillOpacity="0.3" stroke="#98B598" />
        <path d="M51 60 C 60 55, 70 58, 75 65 C 68 70, 58 68, 51 63" fill="#B9CEB9" fillOpacity="0.3" stroke="#98B598" />
        {/* Florets */}
        <circle cx="50" cy="35" r="7" fill="#D9C7F2" fillOpacity="0.5" />
        <circle cx="40" cy="28" r="6.5" fill="#F3DCE4" fillOpacity="0.6" />
        <circle cx="60" cy="28" r="6.5" fill="#D9C7F2" fillOpacity="0.6" />
        <circle cx="34" cy="40" r="6" fill="#F3DCE4" fillOpacity="0.5" />
        <circle cx="66" cy="40" r="6" fill="#E3BDCB" fillOpacity="0.5" />
        <circle cx="42" cy="48" r="6" fill="#D9C7F2" fillOpacity="0.6" />
        <circle cx="58" cy="48" r="6" fill="#F3DCE4" fillOpacity="0.6" />
        <circle cx="50" cy="20" r="6" fill="#E3BDCB" fillOpacity="0.5" />
        {/* Flower centers */}
        <circle cx="50" cy="35" r="1.5" fill="#544458" />
        <circle cx="40" cy="28" r="1.5" fill="#544458" />
        <circle cx="60" cy="28" r="1.5" fill="#544458" />
        <circle cx="34" cy="40" r="1.5" fill="#544458" />
        <circle cx="66" cy="40" r="1.5" fill="#544458" />
        <circle cx="42" cy="48" r="1.5" fill="#544458" />
        <circle cx="58" cy="48" r="1.5" fill="#544458" />
        <circle cx="50" cy="20" r="1.5" fill="#544458" />
      </g>
    </svg>
  );
}

export function RoseIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 48 70, 52 50, 50 35" stroke="#98B598" strokeWidth="2" />
        <path d="M49 65 C 38 60, 32 68, 25 70 C 30 78, 42 75, 49 68" fill="#B9CEB9" fillOpacity="0.3" stroke="#98B598" />
        {/* Rose Petals Spiral */}
        <path d="M50 35 C 40 35, 35 25, 45 18 C 55 12, 65 22, 58 30 C 52 36, 42 32, 44 26 C 46 22, 52 24, 52 27" fill="#F3DCE4" fillOpacity="0.6" />
        <path d="M38 28 C 30 35, 38 48, 50 48 C 62 48, 70 35, 62 28 C 55 20, 45 20, 38 28 Z" fill="#E3BDCB" fillOpacity="0.4" />
      </g>
    </svg>
  );
}

export function DaisyIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 50 70, 50 50, 50 45" stroke="#98B598" strokeWidth="2" />
        {/* Daisy Petals */}
        <ellipse cx="50" cy="22" rx="4" ry="12" fill="#FFFDFB" />
        <ellipse cx="50" cy="62" rx="4" ry="12" fill="#FFFDFB" />
        <ellipse cx="30" cy="42" rx="12" ry="4" fill="#FFFDFB" />
        <ellipse cx="70" cy="42" rx="12" ry="4" fill="#FFFDFB" />
        <ellipse cx="36" cy="28" rx="5" ry="12" transform="rotate(-45 36 28)" fill="#FFFDFB" />
        <ellipse cx="64" cy="28" rx="5" ry="12" transform="rotate(45 64 28)" fill="#FFFDFB" />
        <ellipse cx="36" cy="56" rx="5" ry="12" transform="rotate(45 36 56)" fill="#FFFDFB" />
        <ellipse cx="64" cy="56" rx="5" ry="12" transform="rotate(-45 64 56)" fill="#FFFDFB" />
        {/* Core center */}
        <circle cx="50" cy="42" r="7.5" fill="#E6C280" stroke="#D4AF37" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function LavenderIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BBA1E3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 49 70, 50 40, 50 15" stroke="#98B598" strokeWidth="1.8" />
        {/* Pairs of purple buds */}
        <ellipse cx="44" cy="20" rx="3.5" ry="5.5" transform="rotate(-30 44 20)" fill="#D9C7F2" />
        <ellipse cx="56" cy="20" rx="3.5" ry="5.5" transform="rotate(30 56 20)" fill="#D9C7F2" />
        <ellipse cx="43" cy="30" rx="4" ry="6" transform="rotate(-35 43 30)" fill="#BBA1E3" />
        <ellipse cx="57" cy="30" rx="4" ry="6" transform="rotate(35 57 30)" fill="#BBA1E3" />
        <ellipse cx="42" cy="40" rx="4" ry="6.5" transform="rotate(-35 42 40)" fill="#D9C7F2" />
        <ellipse cx="58" cy="40" rx="4" ry="6.5" transform="rotate(35 58 40)" fill="#D9C7F2" />
        <ellipse cx="44" cy="50" rx="3.5" ry="6" transform="rotate(-30 44 50)" fill="#BBA1E3" />
        <ellipse cx="56" cy="50" rx="3.5" ry="6" transform="rotate(30 56 50)" fill="#BBA1E3" />
        <ellipse cx="50" cy="12" rx="3" ry="5" fill="#D9C7F2" />
      </g>
    </svg>
  );
}

export function TulipIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 49 75, 50 55, 50 45" stroke="#98B598" strokeWidth="2" />
        <path d="M50 75 C 65 65, 75 50, 75 35 C 65 45, 55 60, 50 75" fill="#B9CEB9" fillOpacity="0.3" stroke="#98B598" />
        {/* Tulip Cup */}
        <path d="M35 45 C 30 25, 45 15, 50 25 C 55 15, 70 25, 65 45 C 60 55, 40 55, 35 45 Z" fill="#F3DCE4" fillOpacity="0.6" />
        <path d="M42 45 C 38 30, 48 20, 50 25 C 52 20, 62 30, 58 45" fill="#E3BDCB" fillOpacity="0.4" />
      </g>
    </svg>
  );
}

export function SunflowerIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 50 75, 48 55, 50 45" stroke="#98B598" strokeWidth="2.2" />
        {/* Petals */}
        <ellipse cx="50" cy="20" rx="4" ry="12" fill="#E6C280" />
        <ellipse cx="50" cy="65" rx="4" ry="12" fill="#E6C280" />
        <ellipse cx="28" cy="42" rx="12" ry="4" fill="#E6C280" />
        <ellipse cx="72" cy="42" rx="12" ry="4" fill="#E6C280" />
        <ellipse cx="35" cy="27" rx="4" ry="12" transform="rotate(-45 35 27)" fill="#F7E7CE" />
        <ellipse cx="65" cy="27" rx="4" ry="12" transform="rotate(45 65 27)" fill="#F7E7CE" />
        <ellipse cx="35" cy="58" rx="4" ry="12" transform="rotate(45 35 58)" fill="#F7E7CE" />
        <ellipse cx="65" cy="58" rx="4" ry="12" transform="rotate(-45 65 58)" fill="#F7E7CE" />
        {/* Seed Center */}
        <circle cx="50" cy="42" r="10" fill="#544458" stroke="#3B2F3E" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function PeonyIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 48 75, 52 55, 50 45" stroke="#98B598" strokeWidth="2" />
        <path d="M49 70 C 35 68, 25 75, 20 80 C 28 84, 40 78, 49 72" fill="#B9CEB9" fillOpacity="0.3" stroke="#98B598" />
        {/* Outer lush petals */}
        <circle cx="50" cy="38" r="26" fill="#F3DCE4" fillOpacity="0.5" stroke="#E3BDCB" />
        <path d="M30 42 C 26 28, 42 20, 50 24 C 58 20, 74 28, 70 42 C 65 56, 35 56, 30 42 Z" fill="#E3BDCB" fillOpacity="0.6" />
        <path d="M38 36 C 35 28, 45 24, 50 28 C 55 24, 65 28, 62 36 C 58 44, 42 44, 38 36 Z" fill="#BE839A" fillOpacity="0.5" />
        <circle cx="50" cy="35" r="4" fill="#D4AF37" fillOpacity="0.7" />
      </g>
    </svg>
  );
}

export function OrchidIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 48 65, 52 45, 50 25" stroke="#98B598" strokeWidth="1.8" />
        {/* Orchid upper sepal */}
        <ellipse cx="50" cy="24" rx="8" ry="14" fill="#FFFDFB" stroke="#D9C7F2" strokeWidth="1" />
        {/* Lateral petals */}
        <ellipse cx="34" cy="36" rx="13" ry="9" transform="rotate(-20 34 36)" fill="#FFFDFB" stroke="#D9C7F2" strokeWidth="1" />
        <ellipse cx="66" cy="36" rx="13" ry="9" transform="rotate(20 66 36)" fill="#FFFDFB" stroke="#D9C7F2" strokeWidth="1" />
        {/* Lower lip (labellum) */}
        <path d="M44 40 C 40 50, 46 56, 50 56 C 54 56, 60 50, 56 40 C 53 44, 47 44, 44 40 Z" fill="#F3DCE4" stroke="#BE839A" />
        <circle cx="50" cy="42" r="2.5" fill="#D4AF37" />
      </g>
    </svg>
  );
}

export function BabysBreathIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#98B598" strokeWidth="1.3" strokeLinecap="round">
        <path d="M50 95 C 50 70, 50 50, 50 35" />
        <path d="M50 65 C 40 55, 32 45, 25 38" />
        <path d="M50 55 C 60 48, 68 40, 75 32" />
        <path d="M25 38 C 20 32, 18 25, 16 20" />
        <path d="M25 38 C 28 30, 30 24, 32 18" />
        <path d="M75 32 C 72 24, 70 18, 68 14" />
        <path d="M75 32 C 80 26, 84 22, 88 18" />
        <path d="M50 35 C 46 26, 44 20, 42 14" />
        <path d="M50 35 C 54 26, 56 20, 58 14" />
      </g>
      {/* Tiny white clouds/blossoms */}
      <g fill="#FFFDFB" stroke="#BE839A" strokeWidth="0.8">
        <circle cx="16" cy="20" r="3.5" />
        <circle cx="32" cy="18" r="3.5" />
        <circle cx="42" cy="14" r="3.5" />
        <circle cx="58" cy="14" r="3.5" />
        <circle cx="68" cy="14" r="3.5" />
        <circle cx="88" cy="18" r="3.5" />
        <circle cx="28" cy="34" r="3" />
        <circle cx="70" cy="28" r="3" />
        <circle cx="50" cy="26" r="3.2" />
      </g>
    </svg>
  );
}

export function CherryBlossomIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="#BE839A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 95 C 48 70, 52 50, 50 42" stroke="#98B598" strokeWidth="2" />
        {/* 5 Petals with characteristic notch */}
        <ellipse cx="50" cy="22" rx="7" ry="11" fill="#F3DCE4" fillOpacity="0.7" />
        <ellipse cx="69" cy="35" rx="7" ry="11" transform="rotate(72 69 35)" fill="#F3DCE4" fillOpacity="0.7" />
        <ellipse cx="62" cy="58" rx="7" ry="11" transform="rotate(144 62 58)" fill="#F3DCE4" fillOpacity="0.7" />
        <ellipse cx="38" cy="58" rx="7" ry="11" transform="rotate(216 38 58)" fill="#F3DCE4" fillOpacity="0.7" />
        <ellipse cx="31" cy="35" rx="7" ry="11" transform="rotate(288 31 35)" fill="#F3DCE4" fillOpacity="0.7" />
        {/* Pistils / stamens */}
        <circle cx="50" cy="42" r="5" fill="#E3BDCB" />
        <circle cx="50" cy="42" r="2" fill="#D4AF37" />
      </g>
    </svg>
  );
}

export function WaxSeal({ variant = "STANDARD" }: { variant?: "STANDARD" | "SPECIAL_LEADER" }) {
  const isSpecial = variant === "SPECIAL_LEADER";
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full p-3 shadow-lg transition-transform hover:scale-105 ${
        isSpecial
          ? "bg-gradient-to-br from-gold-warm via-gold to-gold-rosegold shadow-gold"
          : "bg-gradient-to-br from-dusty via-dusty-dark to-plum shadow-soft"
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border border-dashed ${
          isSpecial ? "border-ivory/60 bg-gold/30" : "border-blush/60 bg-plum-dark/40"
        }`}
      >
        <span
          className={`font-serif text-sm font-semibold tracking-wider ${
            isSpecial ? "text-ivory" : "text-blush-light"
          }`}
        >
          20·10
        </span>
      </div>
    </div>
  );
}
