import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // obavezno ime repozitorijuma:
  base: '/baby-registry/',
})
