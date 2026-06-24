import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    strictPort: true
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})
