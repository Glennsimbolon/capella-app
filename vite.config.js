import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/capella-app/',  // <-- PASTIKAN INI!
  build: {
    sourcemap: false,
    outDir: 'dist'
  }
})