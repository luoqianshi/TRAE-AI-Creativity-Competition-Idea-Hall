/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
          tint: "var(--brand-tint)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
        },
        income: "var(--income)",
        expense: "var(--expense)",
        success: {
          DEFAULT: "var(--state-success)",
          light: "var(--state-success-light)",
        },
        warning: "var(--state-warning)",
        error: "var(--state-error)",
        info: "var(--state-info)",
        text1: "var(--text-1)",
        text2: "var(--text-2)",
        text3: "var(--text-3)",
        text4: "var(--text-4)",
        bgpage: "var(--bg-page)",
        bgcard: "var(--bg-card)",
        bgelevated: "var(--bg-elevated)",
        borderbase: "var(--border)",
        "border-strong": "var(--border-strong)",
        fill: "var(--fill)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        s1: "var(--shadow-1)",
        s2: "var(--shadow-2)",
        s3: "var(--shadow-3)",
        fab: "0 4px 16px rgba(229,77,66,0.35)",
      },
      fontFamily: {
        sans: "var(--font-family)",
      },
      fontSize: {
        display: ["32px", "1.2"],
        h1: ["24px", "1.3"],
        h2: ["18px", "1.4"],
        body: ["15px", "1.6"],
        caption: ["13px", "1.5"],
        mini: ["11px", "1.4"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(.2,.8,.2,1)",
      },
    },
  },
  plugins: [],
};
