/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        // 墨色系 - 主色，象征书卷与传承
        ink: {
          50: "#f6f6f9",
          100: "#e9e9f0",
          200: "#d0d0de",
          300: "#a8a8be",
          400: "#7a7a9a",
          500: "#545477",
          600: "#3d3d5e",
          700: "#2a2a48",
          800: "#1a1a2e",
          900: "#0f0f1e",
          950: "#080812",
        },
        // 宣纸色 - 背景基底，营造纸质感
        xuan: {
          50: "#fdfbf7",
          100: "#faf6ee",
          200: "#f5f1e8",
          300: "#ede7d6",
          400: "#e0d8c2",
          500: "#c9bf9f",
          600: "#b0a585",
          700: "#8e8568",
          800: "#6e674f",
          900: "#4a4536",
        },
        // 朱砂红 - 强调色，重要操作和选中状态
        cinnabar: {
          50: "#fdf3f1",
          100: "#fbe4df",
          200: "#f6ccc3",
          300: "#eea69a",
          400: "#e27a68",
          500: "#c8553d",
          600: "#b04530",
          700: "#8f3727",
          800: "#6e2b20",
          900: "#4a1d16",
        },
        // 竹青色 - 成功状态和血缘关系线
        bamboo: {
          50: "#f3f7f3",
          100: "#e3ede4",
          200: "#c8dcc9",
          300: "#a3c3a4",
          400: "#7da67f",
          500: "#5b8c5a",
          600: "#477348",
          700: "#395c3a",
          800: "#2e4a2f",
          900: "#1f3220",
        },
        // 金色 - 装饰线和等级标识
        gold: {
          50: "#fdf9ed",
          100: "#faf0d0",
          200: "#f5e0a1",
          300: "#eeca6e",
          400: "#dab545",
          500: "#c9a961",
          600: "#a88a3f",
          700: "#856c30",
          800: "#5e4d22",
          900: "#3d3216",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xuan: "0.5rem",
      },
      boxShadow: {
        paper: "0 1px 3px rgba(26, 26, 46, 0.08), 0 1px 2px rgba(26, 26, 46, 0.04)",
        "paper-md": "0 4px 12px rgba(26, 26, 46, 0.1), 0 2px 4px rgba(26, 26, 46, 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
