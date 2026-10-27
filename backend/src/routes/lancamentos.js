import { Router } from 'express';
import { db } from '../db.js';
import { custoPorKm, indicadoresDoDia } from '../calculos.js';
import { numero, dataISO, erro } from '../validacao.js';
import { buscarPerfil } from './perfil.js';

export const lancamentosRouter = Router();

const comIndicadores = (l) => ({ ...l, ...indicadoresDoDia(l) });

// GET /api/lancamentos?de=AAAA-MM-DD&ate=AAAA-MM-DD -> lista (mais recentes primeiro)
lancamentosRouter.get('/', (req, res) => {
  const de = req.query.de ? dataISO(req.query.de) : '0000-01-01';
  const ate = req.query.ate ? dataISO(req.query.ate) : '9999-12-31';
  const linhas = db
    .prepare('SELECT * FROM lancamentos WHERE data BETWEEN ? AND ? ORDER BY data DESC')
    .all(de, ate);
  res.json(linhas.map(comIndicadores));
});

// GET /api/lancamentos/:data -> lançamento de um dia
lancamentosRouter.get('/:data', (req, res) => {
  const linha = db.prepare('SELECT * FROM lancamentos WHERE data = ?').get(dataISO(req.params.data));
  if (!linha) throw erro('Nenhum lançamento nesse dia.', 404);
  res.json(comIndicadores(linha));
});

// PUT /api/lancamentos/:data -> cria ou atualiza o lançamento do dia
lancamentosRouter.put('/:data', (req, res) => {
  const perfil = buscarPerfil();
  if (!perfil) throw erro('Cadastre seu veículo antes de lançar um dia.', 409);

  const b = req.body || {};
  const dados = {
    data: dataISO(req.params.data),
    ganho_uber: numero(b.ganho_uber, { campo: 'o ganho na Uber' }),
    ganho_99: numero(b.ganho_99, { campo: 'o ganho na 99' }),
    ganho_outros: numero(b.ganho_outros, { campo: 'outros ganhos' }),
    km_rodados: numero(b.km_rodados, { campo: 'os km rodados' }),
    horas_trabalhadas: numero(b.horas_trabalhadas, { campo: 'as horas trabalhadas' }),
    gastos_extras: numero(b.gastos_extras, { campo: 'os gastos extras' }),
    custo_km_aplicado: custoPorKm(perfil).total_km,
    observacao: String(b.observacao || '').trim() || null,
  };

  db.prepare(`
    INSERT INTO lancamentos (data, ganho_uber, ganho_99, ganho_outros, km_rodados, horas_trabalhadas, gastos_extras, custo_km_aplicado, observacao)
    VALUES (:data, :ganho_uber, :ganho_99, :ganho_outros, :km_rodados, :horas_trabalhadas, :gastos_extras, :custo_km_aplicado, :observacao)
    ON CONFLICT(data) DO UPDATE SET
      ganho_uber = excluded.ganho_uber, ganho_99 = excluded.ganho_99, ganho_outros = excluded.ganho_outros,
      km_rodados = excluded.km_rodados, horas_trabalhadas = excluded.horas_trabalhadas,
      gastos_extras = excluded.gastos_extras, custo_km_aplicado = excluded.custo_km_aplicado,
      observacao = excluded.observacao, atualizado_em = datetime('now')
  `).run(dados);

  const linha = db.prepare('SELECT * FROM lancamentos WHERE data = ?').get(dados.data);
  res.json(comIndicadores(linha));
});

// DELETE /api/lancamentos/:data
lancamentosRouter.delete('/:data', (req, res) => {
  const r = db.prepare('DELETE FROM lancamentos WHERE data = ?').run(dataISO(req.params.data));
  if (r.changes === 0) throw erro('Nenhum lançamento nesse dia.', 404);
  res.status(204).end();
});
