import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ako želiš da zadržiš i GH Pages paralelno, možemo ovako:
// setuj VITE_GH_PAGES=1 samo za GH Pages build.
const isGh = process.env.VITE_GH_PAGES === '1'

export default defineConfig({
  plugins: [react()],
  base: isGh ? '/baby-registry/' : '/',   // 👈 na Vercel/Netlify biće '/'
})
