import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy faz as chamadas /api irem para o backend (porta 3001) durante o desenvolvimento.
// No modo "pages" o app é publicado em lucasmd10.github.io/Quil-metro-Labs/ e roda sem backend.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/Quil-metro-Labs/' : '/',
  build: mode === 'pages' ? { outDir: 'dist-pages' } : {},
  server: {
    port: 5173,
    host: true, // também abre no celular pela rede local (npm run dev mostra o endereço)
    proxy: { '/api': 'http://localhost:3001' },
  },
}));
