import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');

          // Three.js 3D rendering engine and plugins
          if (normalizedId.includes('/node_modules/three/')) {
            return 'vendor-three';
          }

          // React 19 core and DOM runtime
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }

          // UI accessories: Lucide icons and Confetti celebratory FX
          if (
            normalizedId.includes('/node_modules/lucide-react/') ||
            normalizedId.includes('/node_modules/canvas-confetti/')
          ) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
});
