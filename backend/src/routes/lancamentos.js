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
  const data = dataISO(req.params.data);

  // O custo por km fica "congelado" no dia em que foi lançado: editar um dia antigo não muda o lucro dele
  // só porque a gasolina subiu. O motorista pode pedir para recalcular com o custo atual (recalcular_custo).
  const existente = db.prepare('SELECT custo_km_aplicado, combustivel_km_aplicado, fixo_km_aplicado FROM lancamentos WHERE data = ?').get(data);
  const atual = custoPorKm(perfil);
  const custo = existente && !b.recalcular_custo
    ? existente
    : { custo_km_aplicado: atual.total_km, combustivel_km_aplicado: atual.combustivel_km, fixo_km_aplicado: atual.fixo_km };

  const dados = {
    data,
    ganho_uber: numero(b.ganho_uber, { campo: 'o ganho na Uber' }),
    ganho_99: numero(b.ganho_99, { campo: 'o ganho na 99' }),
    ganho_outros: numero(b.ganho_outros, { campo: 'outros ganhos' }),
    km_rodados: numero(b.km_rodados, { campo: 'os km rodados', max: 1500 }),
    horas_trabalhadas: numero(b.horas_trabalhadas, { campo: 'as horas trabalhadas', max: 24 }),
    gastos_extras: numero(b.gastos_extras, { campo: 'os gastos extras' }),
    custo_km_aplicado: custo.custo_km_aplicado,
    combustivel_km_aplicado: custo.combustivel_km_aplicado,
    fixo_km_aplicado: custo.fixo_km_aplicado,
    observacao: String(b.observacao || '').trim() || null,
  };

  if (!dados.ganho_uber && !dados.ganho_99 && !dados.ganho_outros && !dados.km_rodados && !dados.horas_trabalhadas && !dados.gastos_extras) {
    throw erro('O dia está vazio. Preencha pelo menos os ganhos ou os km rodados.');
  }

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

  const linha = db.prepare('SELECT * FROM lancamentos WHERE data = ?').get(data);
  res.json(comIndicadores(linha));
});

// DELETE /api/lancamentos/:data
lancamentosRouter.delete('/:data', (req, res) => {
  const r = db.prepare('DELETE FROM lancamentos WHERE data = ?').run(dataISO(req.params.data));
  if (r.changes === 0) throw erro('Nenhum lançamento nesse dia.', 404);
  res.status(204).end();
});
