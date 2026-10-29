import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';

// Trava de segurança: variáveis VITE_ (e NEXT_PUBLIC_) são copiadas para o JS que vai ao navegador.
// O projeto não usa nenhuma, então o build falha se aparecer um .env no front ou uma dessas no ambiente.
const envs = readdirSync(import.meta.dirname).filter((f) => f.startsWith('.env'));
const publicas = Object.keys(process.env).filter((k) => /^(VITE_|NEXT_PUBLIC_)/.test(k));
if (envs.length || publicas.length) {
  throw new Error(`Não use .env nem variáveis VITE_/NEXT_PUBLIC_ no front: elas vão para o navegador. Encontrado: ${[...envs, ...publicas].join(', ')}`);
}

// O proxy faz as chamadas /api irem para o backend (porta 3001) durante o desenvolvimento.
// Só este computador acessa; npm run dev:celular libera a rede local (vite --host).
// No modo "pages" o app é publicado em lucasmd10.github.io/Quil-metro-Labs/ e roda sem backend.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/Quil-metro-Labs/' : '/',
  build: mode === 'pages' ? { outDir: 'dist-pages' } : {},
  // Constante de build (true/false), sem variável de ambiente: nada do .env vai para o navegador.
  define: { __MODO_NAVEGADOR__: JSON.stringify(mode === 'pages') },
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
}));
