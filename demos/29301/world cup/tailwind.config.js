/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'world-cup': {
          'gold': '#D4AF37',
          'silver': '#C0C0C0',
          'bronze': '#CD7F32',
          'blue': '#1e3a5f',
          'red': '#c8102e'
        }
      }
    },
  },
  plugins: [],
}
