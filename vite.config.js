import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/mka/',
  define: {
    'import.meta.env': JSON.stringify({
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
      MODE: process.env.NODE_ENV,
      DEV: process.env.NODE_ENV !== 'production'
    })
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}) 