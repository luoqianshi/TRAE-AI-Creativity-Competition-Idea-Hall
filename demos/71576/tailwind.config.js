/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        herbal: {
          DEFAULT: "#2D4A3E",
          deep: "#1F3329",
          light: "#3F6453",
        },
        ochre: {
          DEFAULT: "#B8763E",
          light: "#D9A86C",
          deep: "#9A5F2E",
        },
        paper: {
          DEFAULT: "#F5EFE0",
          light: "#FAF6EC",
          dark: "#ECE3CC",
        },
        ink: {
          DEFAULT: "#2A2520",
          muted: "#6B5D4F",
          soft: "#8A7B6A",
        },
        seal: "#8B3A3A",
        amber: "#C8923A",
        moss: "#5A7D5A",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "ui-serif", "Georgia", "serif"],
        latin: ['"Cormorant Garamond"', "ui-serif", "Georgia", "serif"],
        brush: ['"Ma Shan Zheng"', "cursive"],
      },
      boxShadow: {
        specimen:
          "0 1px 2px rgba(45,74,62,0.06), 0 8px 24px -12px rgba(45,74,62,0.18)",
        "specimen-hover":
          "0 2px 4px rgba(45,74,62,0.08), 0 18px 40px -14px rgba(45,74,62,0.28)",
        inset: "inset 0 0 0 1px rgba(45,74,62,0.14)",
      },
      borderRadius: {
        specimen: "14px",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 20%, rgba(184,118,62,0.05), transparent 45%), radial-gradient(circle at 80% 0%, rgba(45,74,62,0.05), transparent 40%), radial-gradient(circle at 50% 100%, rgba(184,118,62,0.04), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "seal-stamp": {
          "0%": { opacity: "0", transform: "rotate(-14deg) scale(1.25)" },
          "60%": { opacity: "1", transform: "rotate(-8deg) scale(1.05)" },
          "100%": { opacity: "1", transform: "rotate(-6deg) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        "seal-stamp": "seal-stamp 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },
  plugins: [],
};
