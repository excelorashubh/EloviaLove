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
  }
})
