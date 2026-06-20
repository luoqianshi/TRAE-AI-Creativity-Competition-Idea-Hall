/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          dark: '#E55A2B',
        },
        secondary: '#2ECC71',
        background: '#F5F5F5',
        card: '#FFFFFF',
        text: {
          primary: '#424242',
          secondary: '#9E9E9E',
        },
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'button': '0 4px 12px rgba(255,107,53,0.3)',
        'modal': '0 8px 32px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}