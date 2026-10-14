import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#FFFFFF",
          100: "#FFFDFB",
          DEFAULT: "#FFF9F5",
          200: "#FBF3ED",
          300: "#F4E8DF",
        },
        blush: {
          light: "#FDF5F8",
          DEFAULT: "#F3DCE4",
          dark: "#E3BDCB",
        },
        lavender: {
          light: "#F4EFFC",
          DEFAULT: "#D9C7F2",
          dark: "#BBA1E3",
        },
        sage: {
          light: "#E8F0E8",
          DEFAULT: "#B9CEB9",
          dark: "#98B598",
        },
        plum: {
          light: "#78657C",
          DEFAULT: "#544458",
          dark: "#3B2F3E",
        },
        dusty: {
          light: "#D8AAB9",
          DEFAULT: "#BE839A",
          dark: "#A36980",
        },
        gold: {
          light: "#FDF8ED",
          champagne: "#F7E7CE",
          DEFAULT: "#D4AF37",
          warm: "#E6C280",
          rosegold: "#B76E79",
        },
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-vietnam)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(84, 68, 88, 0.08)",
        "soft-lg": "0 20px 40px -15px rgba(84, 68, 88, 0.12)",
        vintage: "0 4px 20px -2px rgba(84, 68, 88, 0.06), 0 2px 6px -1px rgba(84, 68, 88, 0.04)",
        letter: "0 15px 35px -5px rgba(84, 68, 88, 0.15), 0 5px 15px rgba(0, 0, 0, 0.05)",
        gold: "0 10px 30px -5px rgba(212, 175, 55, 0.3)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
        drift: {
          "0%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(15px, -20px) rotate(10deg)" },
          "100%": { transform: "translate(0, 0) rotate(0deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
