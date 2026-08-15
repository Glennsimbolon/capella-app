import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/capella-credit-app-v2/',
  build: {
    sourcemap: false,
    outDir: 'dist'
  }
})