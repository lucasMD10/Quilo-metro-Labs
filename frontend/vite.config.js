import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy faz as chamadas /api irem para o backend (porta 3001) durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // também abre no celular pela rede local (npm run dev mostra o endereço)
    proxy: { '/api': 'http://localhost:3001' },
  },
});
