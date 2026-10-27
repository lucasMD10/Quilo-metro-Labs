import { Router } from 'express';
import { db } from '../db.js';
import { custoPorKm, custosFixosMensais, kmMensal } from '../calculos.js';
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

  const dias = numero(b.dias_por_semana, { campo: 'os dias por semana', obrigatorio: true, maiorQueZero: true });
  if (dias > 7) throw erro('Os dias por semana vão de 1 a 7.');

  const dados = {
    nome,
    apps: String(b.apps || 'uber,99'),
    meta_diaria: numero(b.meta_diaria, { campo: 'a meta diária' }),
    modelo_veiculo: String(b.modelo_veiculo || '').trim() || null,
    consumo_km_l: numero(b.consumo_km_l, { campo: 'quantos km o carro faz por litro', obrigatorio: true, maiorQueZero: true }),
    preco_combustivel: numero(b.preco_combustivel, { campo: 'o preço do litro', obrigatorio: true, maiorQueZero: true }),
    km_por_dia: numero(b.km_por_dia, { campo: 'quantos km você roda por dia', obrigatorio: true, maiorQueZero: true }),
    dias_por_semana: dias,
    custo_parcela: numero(b.custo_parcela, { campo: 'a parcela ou aluguel' }),
    custo_seguro: numero(b.custo_seguro, { campo: 'o seguro' }),
    custo_ipva: numero(b.custo_ipva, { campo: 'o IPVA' }),
    custo_manutencao: numero(b.custo_manutencao, { campo: 'a manutenção' }),
    custo_depreciacao: numero(b.custo_depreciacao, { campo: 'a depreciação' }),
    custo_outros: numero(b.custo_outros, { campo: 'os outros custos' }),
  };
  dados.custos_fixos_mensais = custosFixosMensais(dados);
  dados.km_mensal_estimado = kmMensal(dados);

  const colunas = Object.keys(dados);
  db.prepare(`
    INSERT INTO perfil (id, ${colunas.join(', ')})
    VALUES (1, ${colunas.map((c) => `:${c}`).join(', ')})
    ON CONFLICT(id) DO UPDATE SET
      ${colunas.map((c) => `${c} = excluded.${c}`).join(', ')}, atualizado_em = datetime('now')
  `).run(dados);

  const perfil = buscarPerfil();
  res.json({ ...perfil, custo: custoPorKm(perfil) });
});

export { buscarPerfil };
