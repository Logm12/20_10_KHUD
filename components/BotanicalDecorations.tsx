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
