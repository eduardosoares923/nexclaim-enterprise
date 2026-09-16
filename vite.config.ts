/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React + TypeScript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-planilha': ['xlsx', 'xlsx-js-style'],
          'vendor-documento': ['docxtemplater', 'pizzip', 'docx-preview'],
        },
      },
    },
  },
});
