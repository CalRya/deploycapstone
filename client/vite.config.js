import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use '/' for Vercel deployment
  build: {
    outDir: 'dist', // Ensure Vite outputs to "dist"
  },
  server: {
    historyApiFallback: true, // Ensures proper client-side routing
  },
});
