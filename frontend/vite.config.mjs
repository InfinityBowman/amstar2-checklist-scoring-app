import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import solid from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  base: '/amstar2-checklist-scoring-app',
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@primitives': path.resolve(__dirname, 'src/primitives'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@offline': path.resolve(__dirname, 'src/offline'),
    },
  },
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
    target: 'esnext',
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
  plugins: [
    tailwindcss(),
    solid(),
    VitePWA({
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      injectManifest: {
        minify: false,
        enableWorkboxModulesLogs: true,
      },
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'CoRATES',
        short_name: 'CoRATES',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: 'favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  test: {
    setupFiles: ['./src/tests/vitest.setup.js'],
    globals: true,
  },
});
