/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        kid: {
          sky: '#4FC3F7',
          coral: '#FF8A65',
          lemon: '#FFD54F',
          mint: '#81C784',
          lavender: '#BA68C8',
          pink: '#F48FB1',
          bg1: '#E3F2FD',
          bg2: '#E8F5E9',
          card: '#FFFFFF',
          text: '#2C3E50',
          textLight: '#7F8C8D',
        },
      },
      fontFamily: {
        kid: ['"Comic Sans MS"', '"Chalkboard SE"', '"Quicksand"', 'system-ui', 'sans-serif'],
        title: ['"Comic Sans MS"', '"Baloo"', '"Quicksand"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-kid': '20px',
        '2xl-kid': '28px',
        '3xl-kid': '36px',
      },
      boxShadow: {
        'kid': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
        'kid-lg': '0 16px 48px -8px rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
        'kid-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'spin-slow': 'spin 4s linear infinite',
        'rainbow': 'rainbow 3s ease infinite',
        'star-burst': 'starBurst 0.6s ease-out forwards',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        rainbow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        starBurst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(2) rotate(180deg)', opacity: '0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
