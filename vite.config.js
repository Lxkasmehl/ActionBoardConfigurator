import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: false,
    outDir: 'dist', // der von dir gewünschte Ausgabeordner
    assetsInlineLimit: 0, // damit alle Dateien in die Ausgabe kopiert werden
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js', // Hier wird der Name der Hauptdatei festgelegt
        chunkFileNames: 'chunks/[name].js', // Wenn du Dateien für dynamische Importe anpassen möchtest
        assetFileNames: 'assets/[name].[ext]', // Wenn du benannte Assets anpassen möchtest
      },
    },
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://api5.successfactors.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
