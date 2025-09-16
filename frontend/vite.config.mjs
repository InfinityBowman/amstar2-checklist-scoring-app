import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: '/amstar2-checklist-scoring-app',
  plugins: [
    tailwindcss(),
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'CoRATES',
        short_name: 'CoRATES',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  test: {
    // environment: 'jsdom',
    setupFiles: ['./src/test/vitest.setup.js'],
    globals: true,
    // transformMode: {
    //   web: [/\.[jt]sx$/],
    // },
  },
});
