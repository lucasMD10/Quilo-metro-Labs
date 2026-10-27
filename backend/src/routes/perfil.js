import { Router } from 'express';
import { db } from '../db.js';
import { custoPorKm } from '../calculos.js';
import { numero, erro } from '../validacao.js';

export const perfilRouter = Router();

function buscarPerfil() {
  return db.prepare('SELECT * FROM perfil WHERE id = 1').get() || null;
}

// GET /api/perfil -> perfil do motorista + custo por km calculado (ou null se ainda não cadastrou)
perfilRouter.get('/', (req, res) => {
  const perfil = buscarPerfil();
  if (!perfil) return res.json(null);
  res.json({ ...perfil, custo: custoPorKm(perfil) });
});

// PUT /api/perfil -> cria ou atualiza o perfil
perfilRouter.put('/', (req, res) => {
  const b = req.body || {};
  const nome = String(b.nome || '').trim();
  if (!nome) throw erro('Informe seu nome.');

  const dados = {
    nome,
    apps: String(b.apps || 'uber,99'),
    meta_diaria: numero(b.meta_diaria, { campo: 'a meta diária' }),
    modelo_veiculo: String(b.modelo_veiculo || '').trim() || null,
    consumo_km_l: numero(b.consumo_km_l, { campo: 'o consumo (km/l)', obrigatorio: true, maiorQueZero: true }),
    preco_combustivel: numero(b.preco_combustivel, { campo: 'o preço do combustível', obrigatorio: true, maiorQueZero: true }),
    custos_fixos_mensais: numero(b.custos_fixos_mensais, { campo: 'os custos fixos' }),
    km_mensal_estimado: numero(b.km_mensal_estimado, { campo: 'os km rodados por mês', obrigatorio: true, maiorQueZero: true }),
  };

  db.prepare(`
    INSERT INTO perfil (id, nome, apps, meta_diaria, modelo_veiculo, consumo_km_l, preco_combustivel, custos_fixos_mensais, km_mensal_estimado)
    VALUES (1, :nome, :apps, :meta_diaria, :modelo_veiculo, :consumo_km_l, :preco_combustivel, :custos_fixos_mensais, :km_mensal_estimado)
    ON CONFLICT(id) DO UPDATE SET
      nome = excluded.nome, apps = excluded.apps, meta_diaria = excluded.meta_diaria,
      modelo_veiculo = excluded.modelo_veiculo, consumo_km_l = excluded.consumo_km_l,
      preco_combustivel = excluded.preco_combustivel, custos_fixos_mensais = excluded.custos_fixos_mensais,
      km_mensal_estimado = excluded.km_mensal_estimado, atualizado_em = datetime('now')
  `).run(dados);

  const perfil = buscarPerfil();
  res.json({ ...perfil, custo: custoPorKm(perfil) });
});

export { buscarPerfil };
