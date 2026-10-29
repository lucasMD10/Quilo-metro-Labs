import express from 'express';
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
// Por padrão a API só atende este computador. Para abrir no celular, a rede local é liberada de propósito
// (npm run start:celular ou ABRIR-NO-CELULAR.bat): quem estiver no mesmo Wi-Fi passa a ver e alterar os dados.
const NA_REDE = process.argv.includes('--rede');

// Sem CORS: o front é servido pela própria API (ou pelo proxy do Vite), então outros sites não leem a API.
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
  // JSON malformado ou corpo grande demais chegam do express.json com mensagem em inglês.
  const mensagem = status === 500 ? 'Erro interno no servidor.'
    : err.type === 'entity.parse.failed' ? 'Os dados enviados não estão no formato certo.'
    : err.type === 'entity.too.large' ? 'Os dados enviados são grandes demais.'
    : err.message;
  res.status(status).json({ erro: mensagem, ...(err.confirmar ? { confirmar: true } : {}) });
});

const servidor = app.listen(PORTA, NA_REDE ? '0.0.0.0' : '127.0.0.1', () => {
  const url = `http://localhost:${PORTA}`;
  console.log(`KM Real rodando em ${url}`);
  if (NA_REDE) {
    // Endereços na rede local, para abrir no celular conectado ao mesmo Wi-Fi.
    const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal);
    for (const { address } of ips) console.log(`No celular (mesmo Wi-Fi): http://${address}:${PORTA}`);
    console.log('Atenção: quem estiver nessa rede consegue abrir o app. Use só em rede de confiança.');
  } else {
    console.log('Só este computador acessa. Para abrir no celular, use npm run start:celular.');
  }
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
