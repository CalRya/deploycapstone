import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use '/' for Vercel deployment
  build: {
    outDir: 'dist', // Ensure Vite outputs to "dist"
  },
  server: {
    historyApiFallback: true, // Ensures proper client-side routing
  },
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom')
    },
    dedupe: ['react', 'react-dom']
  }
});
