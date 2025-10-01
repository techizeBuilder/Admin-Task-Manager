import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // optional: mirror root aliases if you use them in imports
      '@assets': path.resolve(__dirname, '../attached_assets'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@features': path.resolve(__dirname, './src/features'),
      '@features-shared': path.resolve(__dirname, './src/features/shared'),
      '@features-dashboard': path.resolve(__dirname, './src/features/dashboard'),
      '@features-tasks': path.resolve(__dirname, './src/features/tasks'),
      '@features-calendar': path.resolve(__dirname, './src/features/calendar'),
      '@features-auth': path.resolve(__dirname, './src/features/auth'),
    },
  },
})