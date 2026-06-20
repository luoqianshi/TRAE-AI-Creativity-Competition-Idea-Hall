import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        stream: 'stream-browserify',
        buffer: 'buffer',
        events: 'events',
        util: path.resolve(__dirname, 'src/shared/utils/utilShim.ts'),
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    server: {
      port: 3010,
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3011',
          changeOrigin: true,
        },
      },
    },
  };
});
