import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import './db.js';
import { perfilRouter } from './routes/perfil.js';
import { lancamentosRouter } from './routes/lancamentos.js';
import { resumoRouter } from './routes/resumo.js';

const app = express();
const PORTA = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/saude', (req, res) => res.json({ ok: true, app: 'KM Real API' }));
app.use('/api/perfil', perfilRouter);
app.use('/api/lancamentos', lancamentosRouter);
app.use('/api/resumo', resumoRouter);

// Se o front já foi compilado (npm run build), a própria API serve a interface.
// Assim basta um comando (npm start) e uma porta só, sem precisar do Vite.
const pastaFront = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'dist');
if (existsSync(pastaFront)) {
  app.use(express.static(pastaFront));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(join(pastaFront, 'index.html')));
}

// Tratamento central de erros: devolve sempre { erro: "mensagem" }.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ erro: status === 500 ? 'Erro interno no servidor.' : err.message });
});

const servidor = app.listen(PORTA, () => {
  const url = `http://localhost:${PORTA}`;
  console.log(`KM Real rodando em ${url}`);
  // Endereços na rede local, para abrir no celular conectado ao mesmo Wi-Fi.
  const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal);
  for (const { address } of ips) console.log(`No celular (mesmo Wi-Fi): http://${address}:${PORTA}`);
  // Usado pelo INICIAR.bat: o navegador só abre depois que o servidor subiu de verdade.
  if (process.env.ABRIR_NAVEGADOR) {
    const comando = process.platform === 'win32' ? `start "" ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(comando);
  }
});

servidor.on('error', (err) => {
  if (err.code !== 'EADDRINUSE') throw err;
  console.error(`\nA porta ${PORTA} já está em uso. Provavelmente o KM Real já está aberto em outra janela.`);
  console.error('Feche a outra janela (ou finalize o Node.js no Gerenciador de Tarefas) e tente de novo.\n');
  process.exit(1);
});
