import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['pdfjs-dist']
    },
    base: '/mka/',
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    define: {
      '__OPENAI_API_KEY__': '""'
    }
  }
}) 