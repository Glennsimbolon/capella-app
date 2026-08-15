import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // <-- PAKAI INI!
  build: {
    sourcemap: false,
    outDir: 'dist'
  }
})