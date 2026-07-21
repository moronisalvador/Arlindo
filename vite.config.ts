/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages serves this project at https://<user>.github.io/Arlindo/.
// Override with VITE_BASE='/' for a custom domain or local root serving.
const base = process.env.VITE_BASE ?? '/Arlindo/'

const alias = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  base,
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': alias('./src'),
      '@app': alias('./src/app'),
      '@design-system': alias('./src/design-system'),
      '@domain': alias('./src/domain'),
      '@export': alias('./src/export'),
      '@persistence': alias('./src/persistence'),
      '@features': alias('./src/features'),
      '@shared': alias('./src/shared'),
      '@i18n': alias('./src/i18n'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (not 'autoUpdate') so a new release never reloads the app
      // mid-presentation. The app detects the update in the background and shows
      // an "Atualizar" banner (src/shared/pwa/UpdatePrompt.tsx) that the agent
      // taps when ready. This is what removes the need to hard-refresh (Shift+R)
      // after every deploy.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Arlindo',
        short_name: 'Arlindo',
        description: 'Apresentações de seguros e aposentadoria',
        lang: 'pt-BR',
        theme_color: '#0E2148',
        background_color: '#0E2148',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // With registerType: 'prompt', tapping "Atualizar" posts SKIP_WAITING to
        // the waiting worker. clientsClaim lets that newly-activated worker take
        // control of the already-open tab, which fires `controllerchange` — the
        // event workbox-window waits on before reloading. Without it the reload
        // never fires and the update button appears dead (in every browser, not
        // just installed PWAs).
        clientsClaim: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
