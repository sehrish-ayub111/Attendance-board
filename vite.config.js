import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', 
>>>>>>> old-hrm-project
})