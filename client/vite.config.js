import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Inject env vars into index.html placeholders
      {
        name: 'html-env-inject',
        transformIndexHtml(html) {
          return html
            .replace(/__ADSENSE_CLIENT_ID__/g, env.VITE_ADSENSE_CLIENT_ID || '')
            .replace(/__GA_MEASUREMENT_ID__/g, env.VITE_GA_MEASUREMENT_ID || '')
        },
      },
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      // Intelligent code splitting to reduce initial bundle
      rollupOptions: {
        output: {
          manualChunks: {
            // Core vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', 'lucide-react'],
          },
          // Minimize initial chunk size
          chunkFileNames: 'assets/chunk-[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      // Target modern browsers for smaller output
      target: 'esnext',
      minify: 'esbuild',
      // CSS code splitting
      cssCodeSplit: true,
      // Reduce warning threshold for chunks
      chunkSizeWarningLimit: 500,
      // Source maps only in development
      sourcemap: mode !== 'production',
    },
    // Performance optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'date-fns'],
      exclude: ['@vite/client'],
    },
  }
})
