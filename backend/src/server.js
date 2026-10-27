import express from 'express';
import cors from 'cors';
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

// Tratamento central de erros: devolve sempre { erro: "mensagem" }.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ erro: status === 500 ? 'Erro interno no servidor.' : err.message });
});

app.listen(PORTA, () => console.log(`KM Real API rodando em http://localhost:${PORTA}`));
