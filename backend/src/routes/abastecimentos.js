import { Router } from 'express';
import { db } from '../db.js';
import { dataISO, erro } from '../validacao.js';
import { dadosAbastecimento, comPrecoLitro } from '../regras.js';

// Abastecimentos: registro do dinheiro pago no posto. Não mexem no lucro dos dias.
export const abastecimentosRouter = Router();

const buscar = (id) => db.prepare('SELECT * FROM abastecimentos WHERE id = ?').get(id);
const idValido = (valor) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw erro('Abastecimento não encontrado.', 404);
  return id;
};

// GET /api/abastecimentos?de=AAAA-MM-DD&ate=AAAA-MM-DD -> lista (mais recentes primeiro)
abastecimentosRouter.get('/', (req, res) => {
  const de = req.query.de ? dataISO(req.query.de) : '0000-01-01';
  const ate = req.query.ate ? dataISO(req.query.ate) : '9999-12-31';
  const linhas = db.prepare('SELECT * FROM abastecimentos WHERE data BETWEEN ? AND ? ORDER BY data DESC, id DESC').all(de, ate);
  res.json(linhas.map(comPrecoLitro));
});

// POST /api/abastecimentos -> registra um abastecimento
abastecimentosRouter.post('/', (req, res) => {
  const dados = dadosAbastecimento(req.body || {});
  const r = db.prepare(`
    INSERT INTO abastecimentos (data, valor, combustivel_tipo, litros) VALUES (:data, :valor, :combustivel_tipo, :litros)
  `).run(dados);
  res.status(201).json(comPrecoLitro(buscar(r.lastInsertRowid)));
});

// PUT /api/abastecimentos/:id -> corrige um abastecimento
abastecimentosRouter.put('/:id', (req, res) => {
  const id = idValido(req.params.id);
  if (!buscar(id)) throw erro('Abastecimento não encontrado.', 404);
  const dados = dadosAbastecimento(req.body || {});
  db.prepare(`
    UPDATE abastecimentos SET data = :data, valor = :valor, combustivel_tipo = :combustivel_tipo, litros = :litros,
      atualizado_em = datetime('now') WHERE id = :id
  `).run({ ...dados, id });
  res.json(comPrecoLitro(buscar(id)));
});

// DELETE /api/abastecimentos/:id
abastecimentosRouter.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM abastecimentos WHERE id = ?').run(idValido(req.params.id));
  if (r.changes === 0) throw erro('Abastecimento não encontrado.', 404);
  res.status(204).end();
});
