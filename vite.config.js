import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin zum Patchen von Popper.js
function popperPatchPlugin() {
  return {
    name: 'popper-patch',
    transform(code, id) {
      // Suche nach Popper.js-Dateien
      if (id.includes('@popperjs/core')) {
        // 1. Anpassung der enums.js - basePlacements zu Strings konvertieren
        if (id.includes('enums.js')) {
          console.log(
            'Patching enums.js - converting basePlacements to strings',
          );
          const patchedCode = code.replace(
            /export var basePlacements = \[top, bottom, right, left\];/,
            "export var basePlacements = ['top', 'bottom', 'right', 'left'];",
          );
          return patchedCode;
        }

        // 2. Anpassung der offset.js Dateien - Imports von top, left, right entfernen und Array-Literale zu Strings konvertieren
        if (id.includes('offset.js')) {
          console.log(
            'Patching offset.js - removing top, left, right imports and converting arrays to strings',
          );
          let patchedCode = code;

          // Imports von top, left, right entfernen
          patchedCode = patchedCode.replace(
            /import \{ top, left, right, placements \} from ['"]\.\.\/enums\.js['"];?/,
            "import { placements } from '../enums.js';",
          );

          // Array-Literale zu Strings konvertieren
          patchedCode = patchedCode.replace(
            /\[left, top\]/g,
            "['left', 'top']",
          );
          patchedCode = patchedCode.replace(
            /\[left, right\]/g,
            "['left', 'right']",
          );

          return patchedCode;
        }

        // 3. Anpassung der computeOffsets.js Dateien - Imports entfernen und Variablen durch Strings ersetzen
        if (id.includes('computeOffsets.js')) {
          console.log(
            'Patching computeOffsets.js - replacing imports with string literals',
          );
          let patchedCode = code;

          // Imports von top, right, bottom, left entfernen
          patchedCode = patchedCode.replace(
            /import \{ top, right, bottom, left, start, end \} from ['"]\.\.\/enums\.js['"];?/,
            "import { start, end } from '../enums.js';",
          );

          // top, right, bottom, left Variablen durch Strings ersetzen
          patchedCode = patchedCode.replace(/\bcase top:/g, "case 'top':");
          patchedCode = patchedCode.replace(
            /\bcase bottom:/g,
            "case 'bottom':",
          );
          patchedCode = patchedCode.replace(/\bcase right:/g, "case 'right':");
          patchedCode = patchedCode.replace(/\bcase left:/g, "case 'left':");

          return patchedCode;
        }

        // 4. Anpassung der getOppositePlacement.js - hash object keys zu Strings konvertieren
        if (id.includes('getOppositePlacement.js')) {
          console.log(
            'Patching getOppositePlacement.js - converting hash object keys to strings',
          );
          let patchedCode = code;

          // hash object keys von Variablen zu String-Literalen konvertieren
          patchedCode = patchedCode.replace(
            /var hash = \{\s*left: 'right',\s*right: 'left',\s*bottom: 'top',\s*top: 'bottom'\s*\};/,
            "var hash = {\n  'left': 'right',\n  'right': 'left',\n  'bottom': 'top',\n  'top': 'bottom'\n};",
          );

          return patchedCode;
        }

        // 5. Anpassung der Utility.js - replace function mit null/undefined check
        if (id.includes('Utility.js') || id.includes('chunk-HYK4YD6D.js')) {
          console.log(
            'Patching Utility.js - adding null/undefined check to replace function',
          );
          let patchedCode = code;

          // replace function mit null/undefined check erweitern
          patchedCode = patchedCode.replace(
            /function replace\(value, pattern, replacement\) \{\s*return value\.replace\(pattern, replacement\);\s*\}/,
            "function replace(value, pattern, replacement) {\n  if (value == null || typeof value !== 'string') {\n    return value;\n  }\n  return value.replace(pattern, replacement);\n}",
          );

          return patchedCode;
        }

        // 6. Anpassung der eventListeners.js - getOppositePlacement mit null/undefined check
        if (id.includes('eventListeners.js')) {
          console.log(
            'Patching eventListeners.js - adding null/undefined check to getOppositePlacement',
          );
          let patchedCode = code;

          // getOppositePlacement function mit null/undefined check erweitern
          patchedCode = patchedCode.replace(
            /function getOppositePlacement\(placement\) \{[^}]*\}/,
            "function getOppositePlacement(placement) {\n  if (placement == null || typeof placement !== 'string') {\n    return 'top';\n  }\n  var hash = {\n    'left': 'right',\n    'right': 'left',\n    'bottom': 'top',\n    'top': 'bottom'\n  };\n  return hash[placement] || 'top';\n}",
          );

          return patchedCode;
        }
      }
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), popperPatchPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: false,
    outDir: 'dist', // der von dir gewünschte Ausgabeordner
    assetsInlineLimit: 0, // damit alle Dateien in die Ausgabe kopiert werden
    sourcemap: true,
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
