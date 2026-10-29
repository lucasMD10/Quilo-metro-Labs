import { Router } from 'express';
import { db } from '../db.js';
import { dadosPerfil, perfilCompleto, previaVeiculo } from '../regras.js';

export const perfilRouter = Router();

function buscarPerfil() {
  return db.prepare('SELECT * FROM perfil WHERE id = 1').get() || null;
}

// GET /api/perfil -> perfil do motorista + custo por km calculado (ou null se ainda não cadastrou)
perfilRouter.get('/', (req, res) => {
  res.json(perfilCompleto(buscarPerfil()));
});

// POST /api/perfil/previa -> custo por km e do mês enquanto o motorista preenche (não grava nada)
perfilRouter.post('/previa', (req, res) => {
  res.json(previaVeiculo(req.body || {}));
});

// PUT /api/perfil -> cria ou atualiza o perfil
perfilRouter.put('/', (req, res) => {
  const dados = dadosPerfil(req.body || {});
  const colunas = Object.keys(dados);
  db.prepare(`
    INSERT INTO perfil (id, ${colunas.join(', ')})
    VALUES (1, ${colunas.map((c) => `:${c}`).join(', ')})
    ON CONFLICT(id) DO UPDATE SET
      ${colunas.map((c) => `${c} = excluded.${c}`).join(', ')}, atualizado_em = datetime('now')
  `).run(dados);

  res.json(perfilCompleto(buscarPerfil()));
});

export { buscarPerfil };
