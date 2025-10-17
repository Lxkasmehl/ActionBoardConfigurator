import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4174,
    host: 'localhost',
    strictPort: true,
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    https: (() => {
      const keyPath = path.resolve(__dirname, 'key.pem');
      const certPath = path.resolve(__dirname, 'cert.pem');

      // Only enable HTTPS if certificate files exist (for local development)
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
      }

      // Return false to disable HTTPS in CI or when certificates don't exist
      return false;
    })(),
  },
});
