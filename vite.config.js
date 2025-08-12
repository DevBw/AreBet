import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/logo.svg', 'icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'AreBet – Football Insights',
        short_name: 'AreBet',
        description: 'Futuristic football insights – no betting, just data.',
        theme_color: '#0ea765',
        background_color: '#0a0f0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/v3\.football\.api-sports\.io\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-football-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 }
            }
          }
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: { 
        enabled: process.env.NODE_ENV === 'development',
        type: 'module'
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV === 'development',
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    // Enable HMR with better performance
    hmr: {
      overlay: false,
    },
  },
  preview: {
    port: 4173,
    open: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@supabase/supabase-js'], // Exclude from pre-bundling
  },
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
  },
});


