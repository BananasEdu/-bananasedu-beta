import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Base path: '/' for dev, '/bananasedu-beta/' for build (GitHub Pages)
  base: command === 'serve' ? '/' : '/bananasedu-beta/',
  plugins: [react()],
}))
