import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        forest: 'var(--color-forest)',
        rose: 'var(--color-rose)',
        sky: 'var(--color-sky)',
        sand: 'var(--color-sand)',
        divider: 'var(--color-divider)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Fraunces', 'Noto Serif SC', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(216, 123, 90, 0.18)',
        'soft-lg': '0 12px 32px rgba(216, 123, 90, 0.25)',
        card: '0 4px 16px rgba(42, 42, 42, 0.06)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        breathe: 'breathe 3s ease-in-out infinite',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        floatY: 'floatY 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
