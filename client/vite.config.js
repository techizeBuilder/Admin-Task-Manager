import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Ensure only one React copy (protect against linked packages pulling their own)
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
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
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
    dedupe: ['react', 'react-dom']
  },
})