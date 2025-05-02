export const generatePackageJson = () => {
  return `{
  "name": "exported-website",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/x-charts": "^7.28.0",
    "@mui/icons-material": "^6.4.8",
    "@mui/joy": "^5.0.0-beta.51",
    "@mui/x-data-grid-pro": "^7.28.3",
    "react": "^18.2.0",
    "@reduxjs/toolkit": "^2.5.1",
    "react-redux": "^9.2.0",
    "redux": "^5.0.1",
    "react-dom": "^18.2.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}`;
};

export const generateViteConfig = () => {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});`;
};
