import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#7ED321",
          "green-dark": "#5FAE12",
          aqua: "#2EC4FF",
          "aqua-dark": "#0EA5E0",
          red: "#FF3B30",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F6F9FA",
          mist: "#EFF6F4",
        },
        ink: {
          DEFAULT: "#0E1A1A",
          soft: "#4B5B5A",
        },
        midnight: {
          DEFAULT: "#0A1420",
          card: "#101D2C",
          line: "#1D2E3F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(14, 26, 26, 0.12)",
        "soft-lg": "0 25px 60px -15px rgba(14, 26, 26, 0.18)",
        glow: "0 0 40px -8px rgba(46, 196, 255, 0.45)",
        "glow-green": "0 0 40px -8px rgba(126, 211, 33, 0.45)",
        card: "0 1px 2px rgba(14,26,26,0.04), 0 12px 32px -12px rgba(14,26,26,0.10)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7ED321 0%, #2EC4FF 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(126,211,33,0.16) 0%, rgba(46,196,255,0.16) 100%)",
        "hero-mesh":
          "radial-gradient(60% 50% at 15% 20%, rgba(126,211,33,0.55) 0%, rgba(126,211,33,0) 60%), radial-gradient(55% 50% at 85% 15%, rgba(46,196,255,0.55) 0%, rgba(46,196,255,0) 60%), radial-gradient(70% 60% at 50% 100%, rgba(46,196,255,0.35) 0%, rgba(46,196,255,0) 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(4deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(-3deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
