import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Change the port as needed
    proxy: {
      "/api": {
        target: "https://your-render-backend-url.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
    build: {
      outDir: "dist",
    },
  },
});
