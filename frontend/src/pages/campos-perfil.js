// Valores do perfil como texto, para preencher os inputs (vírgula no lugar do ponto).
const txt = (v) => (v === null || v === undefined || v === 0 ? '' : String(v).replace('.', ','));
const n = (v) => Number(String(v).replace(',', '.')) || 0;

const SEMANAS_POR_MES = 52 / 12;

// Custos fixos do carro, um campo para cada. O IPVA é pedido por ano (é como o motorista conhece).
export const CUSTOS_FIXOS = [
  { nome: 'custo_parcela', rotulo: 'Parcela ou aluguel do carro', sufixo: '/mês' },
  { nome: 'custo_seguro', rotulo: 'Seguro', sufixo: '/mês', dica: 'Se você paga por ano, divida por 12.' },
  { nome: 'custo_ipva', rotulo: 'IPVA e licenciamento', sufixo: '/ano', dica: 'Valor do ano inteiro. O app divide por 12.' },
  { nome: 'custo_manutencao', rotulo: 'Manutenção', sufixo: '/mês', dica: 'Média por mês com óleo, pneus, freios e revisão.' },
  { nome: 'custo_depreciacao', rotulo: 'Depreciação', sufixo: '/mês', dica: 'Quanto o carro perde de valor. Ex.: perde R$ 6.000 por ano = R$ 500 por mês.' },
  { nome: 'custo_outros', rotulo: 'Outros custos fixos', sufixo: '/mês', dica: 'Rastreador, internet do celular, contador.' },
];

export function perfilParaForm(p) {
  // Perfis antigos só têm o total dos custos e os km do mês: o total vai para "Outros"
  // e os km por dia são estimados a partir do mês.
  const semDetalhe = p && p.km_por_dia == null;
  const dias = p?.dias_por_semana || 6;
  return {
    nome: p?.nome || '',
    apps: p?.apps || 'uber,99',
    meta_diaria: txt(p?.meta_diaria),
    modelo_veiculo: p?.modelo_veiculo || '',
    consumo_km_l: txt(p?.consumo_km_l),
    preco_combustivel: txt(p?.preco_combustivel),
    km_por_dia: txt(semDetalhe ? Math.round(p.km_mensal_estimado / (dias * SEMANAS_POR_MES)) : p?.km_por_dia),
    dias_por_semana: String(dias),
    ...Object.fromEntries(CUSTOS_FIXOS.map((c) => [c.nome, txt(p?.[c.nome])])),
    ...(semDetalhe ? { custo_outros: txt(p.custos_fixos_mensais) } : {}),
  };
}

export function formParaPerfil(f) {
  const numericos = ['meta_diaria', 'consumo_km_l', 'preco_combustivel', 'km_por_dia', 'dias_por_semana', ...CUSTOS_FIXOS.map((c) => c.nome)];
  return { ...f, ...Object.fromEntries(numericos.map((k) => [k, n(f[k])])) };
}

// Mesmas contas do backend (calculos.js), para mostrar a prévia enquanto o motorista preenche.
export function previaCusto(f) {
  const custosMes = n(f.custo_parcela) + n(f.custo_seguro) + n(f.custo_ipva) / 12 + n(f.custo_manutencao) + n(f.custo_depreciacao) + n(f.custo_outros);
  const kmMes = Math.round(n(f.km_por_dia) * n(f.dias_por_semana) * SEMANAS_POR_MES);
  const combustivel = n(f.consumo_km_l) > 0 ? n(f.preco_combustivel) / n(f.consumo_km_l) : 0;
  const fixo = kmMes > 0 ? custosMes / kmMes : 0;
  return { combustivel, fixo, total: combustivel + fixo, custosMes, kmMes };
}

// Avisos para valores que provavelmente foram digitados errado.
export function avisosVeiculo(f) {
  const avisos = [];
  const consumo = n(f.consumo_km_l);
  const litro = n(f.preco_combustivel);
  const kmDia = n(f.km_por_dia);
  const { total } = previaCusto(f);
  if (consumo && (consumo < 5 || consumo > 25)) {
    avisos.push(`${f.consumo_km_l} km por litro parece fora do normal. A maioria dos carros faz entre 8 e 16 km/l.`);
  }
  if (litro && (litro < 3 || litro > 10)) {
    avisos.push(`R$ ${f.preco_combustivel} o litro parece fora do normal. Confira o preço que você paga no posto.`);
  }
  if (kmDia && kmDia < 40) {
    avisos.push(`Só ${f.km_por_dia} km por dia? Motoristas de app costumam rodar de 100 a 250 km. Com poucos km, os custos fixos pesam muito em cada km.`);
  }
  if (kmDia > 600) {
    avisos.push(`${f.km_por_dia} km por dia é muita coisa. Confira se não digitou os km do mês.`);
  }
  if (total > 2) {
    avisos.push('Seu custo por km ficou alto. Confira os valores acima: um número errado aqui muda o lucro de todos os dias.');
  }
  return avisos;
}
