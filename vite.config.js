import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'offline.html'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24*365 } }
          },
          {
            urlPattern: /\/data\/wordBanks\.js/,
            handler: 'CacheFirst',
            options: { cacheName: 'word-banks', expiration: { maxEntries: 1, maxAgeSeconds: 60*60*24*30 } }
          }
        ],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api/, /^\/functions/]
      }
    })
  ]
});
