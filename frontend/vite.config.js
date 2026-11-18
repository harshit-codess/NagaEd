import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-server proxy mirrors the nginx routing used in Docker.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/suggest-username': 'http://localhost:8000',
      '/api': 'http://localhost:3000',
    },
  },
});
