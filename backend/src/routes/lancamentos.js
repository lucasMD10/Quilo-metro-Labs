import { Router } from 'express';
import { db } from '../db.js';
import { indicadoresDoDia } from '../calculos.js';
import { dataISO, erro } from '../validacao.js';
import { dadosLancamento, previaLancamento } from '../regras.js';
import { buscarPerfil } from './perfil.js';

export const lancamentosRouter = Router();

const comIndicadores = (l) => ({ ...l, ...indicadoresDoDia(l) });
const buscarDia = (data) => db.prepare('SELECT * FROM lancamentos WHERE data = ?').get(data);

// GET /api/lancamentos?de=AAAA-MM-DD&ate=AAAA-MM-DD -> lista (mais recentes primeiro)
lancamentosRouter.get('/', (req, res) => {
  const de = req.query.de ? dataISO(req.query.de) : '0000-01-01';
  const ate = req.query.ate ? dataISO(req.query.ate) : '9999-12-31';
  const linhas = db
    .prepare('SELECT * FROM lancamentos WHERE data BETWEEN ? AND ? ORDER BY data DESC')
    .all(de, ate);
  res.json(linhas.map(comIndicadores));
});

// POST /api/lancamentos/previa -> a conta do dia enquanto o motorista digita (não grava nada)
// Corpo: os campos do dia + data (para usar o custo por km congelado de um dia já lançado).
lancamentosRouter.post('/previa', (req, res) => {
  const b = req.body || {};
  const existente = b.data ? buscarDia(dataISO(b.data)) : null;
  res.json(previaLancamento(b, { perfil: buscarPerfil(), existente }));
});

// GET /api/lancamentos/:data -> lançamento de um dia
lancamentosRouter.get('/:data', (req, res) => {
  const linha = buscarDia(dataISO(req.params.data));
  if (!linha) throw erro('Nenhum lançamento nesse dia.', 404);
  res.json(comIndicadores(linha));
});

// PUT /api/lancamentos/:data -> cria ou atualiza o lançamento do dia
lancamentosRouter.put('/:data', (req, res) => {
  const data = dataISO(req.params.data);
  const dados = dadosLancamento(req.body || {}, { data, perfil: buscarPerfil(), existente: buscarDia(data) });

  db.prepare(`
    INSERT INTO lancamentos (data, ganho_uber, ganho_99, ganho_outros, km_rodados, horas_trabalhadas, gastos_extras,
                             custo_km_aplicado, combustivel_km_aplicado, fixo_km_aplicado, observacao)
    VALUES (:data, :ganho_uber, :ganho_99, :ganho_outros, :km_rodados, :horas_trabalhadas, :gastos_extras,
            :custo_km_aplicado, :combustivel_km_aplicado, :fixo_km_aplicado, :observacao)
    ON CONFLICT(data) DO UPDATE SET
      ganho_uber = excluded.ganho_uber, ganho_99 = excluded.ganho_99, ganho_outros = excluded.ganho_outros,
      km_rodados = excluded.km_rodados, horas_trabalhadas = excluded.horas_trabalhadas,
      gastos_extras = excluded.gastos_extras, custo_km_aplicado = excluded.custo_km_aplicado,
      combustivel_km_aplicado = excluded.combustivel_km_aplicado, fixo_km_aplicado = excluded.fixo_km_aplicado,
      observacao = excluded.observacao, atualizado_em = datetime('now')
  `).run(dados);

  res.json(comIndicadores(buscarDia(data)));
});

// DELETE /api/lancamentos/:data
lancamentosRouter.delete('/:data', (req, res) => {
  const r = db.prepare('DELETE FROM lancamentos WHERE data = ?').run(dataISO(req.params.data));
  if (r.changes === 0) throw erro('Nenhum lançamento nesse dia.', 404);
  res.status(204).end();
});
