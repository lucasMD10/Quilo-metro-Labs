import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy faz as chamadas /api irem para o backend (porta 3001) durante o desenvolvimento.
// Só este computador acessa; npm run dev:celular libera a rede local (vite --host).
// No modo "pages" o app é publicado em lucasmd10.github.io/Quil-metro-Labs/ e roda sem backend.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/Quil-metro-Labs/' : '/',
  build: mode === 'pages' ? { outDir: 'dist-pages' } : {},
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
}));
