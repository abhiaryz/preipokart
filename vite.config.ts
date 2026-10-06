import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { betterAuthPlugin } from './server/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [betterAuthPlugin(), react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
