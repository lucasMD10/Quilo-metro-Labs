import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy faz as chamadas /api irem para o backend (porta 3001) durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
});
