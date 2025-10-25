import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://incident-reporting-system-uwn1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})