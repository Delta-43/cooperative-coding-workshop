import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site from a sub-path, so the base comes from the build.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
