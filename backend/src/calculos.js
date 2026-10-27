// Regras de negócio do KM Real. Funções puras: recebem números, devolvem números.
// Ficam separadas das rotas para serem fáceis de testar e de explicar na banca.

const arred = (valor, casas = 2) => Math.round(valor * 10 ** casas) / 10 ** casas;

export const SEMANAS_POR_MES = 52 / 12;

/**
 * Custos fixos do mês a partir do detalhamento.
 * O IPVA é informado por ano, então entra dividido por 12.
 */
export function custosFixosMensais(p) {
  return arred(p.custo_parcela + p.custo_seguro + p.custo_ipva / 12 + p.custo_manutencao + p.custo_depreciacao + p.custo_outros);
}

/** Km rodados no mês = km por dia × dias por semana × semanas no mês. */
export function kmMensal(p) {
  return arred(p.km_por_dia * p.dias_por_semana * SEMANAS_POR_MES, 0);
}

/**
 * Custo real por quilômetro do veículo.
 *  - combustível/km = preço do litro ÷ km por litro
 *  - fixo/km        = custos fixos do mês ÷ km rodados no mês
 */
export function custoPorKm(perfil) {
  const combustivelKm = perfil.preco_combustivel / perfil.consumo_km_l;
  const fixoKm = perfil.custos_fixos_mensais / perfil.km_mensal_estimado;
  return {
    combustivel_km: arred(combustivelKm, 4),
    fixo_km: arred(fixoKm, 4),
    total_km: arred(combustivelKm + fixoKm, 4),
  };
}

/** Indicadores de um dia lançado. */
export function indicadoresDoDia(lanc) {
  const bruto = lanc.ganho_uber + lanc.ganho_99 + lanc.ganho_outros;
  const custoRodagem = lanc.km_rodados * lanc.custo_km_aplicado;
  const custoTotal = custoRodagem + lanc.gastos_extras;
  const lucro = bruto - custoTotal;
  return {
    bruto: arred(bruto),
    custo_rodagem: arred(custoRodagem),
    custo_total: arred(custoTotal),
    lucro: arred(lucro),
    ganho_por_km: lanc.km_rodados > 0 ? arred(bruto / lanc.km_rodados) : 0,
    lucro_por_km: lanc.km_rodados > 0 ? arred(lucro / lanc.km_rodados) : 0,
    lucro_por_hora: lanc.horas_trabalhadas > 0 ? arred(lucro / lanc.horas_trabalhadas) : 0,
  };
}

/** Soma os indicadores de vários dias. */
export function totalizar(dias) {
  const soma = (campo) => dias.reduce((acc, d) => acc + (d[campo] || 0), 0);
  const km = soma('km_rodados');
  const bruto = soma('bruto');
  const lucro = soma('lucro');
  const horas = soma('horas_trabalhadas');
  return {
    dias_trabalhados: dias.filter((d) => d.lancado).length,
    bruto: arred(bruto),
    custo_total: arred(soma('custo_total')),
    lucro: arred(lucro),
    km_rodados: arred(km, 1),
    horas_trabalhadas: arred(horas, 1),
    lucro_por_km: km > 0 ? arred(lucro / km) : 0,
    lucro_por_hora: horas > 0 ? arred(lucro / horas) : 0,
  };
}

/**
 * Fechamento do mês: compara os custos fixos que os dias lançados já descontaram (km × custo fixo por km)
 * com o que os custos fixos custaram de fato no período. No mês atual, o período vai até hoje.
 *  - diferença < 0: o motorista rodou menos que o previsto e parte dos custos fixos ainda não saiu do lucro;
 *  - diferença > 0: rodou mais e os dias descontaram a mais.
 * lucro ajustado = lucro estimado dos dias + diferença.
 */
export function fechamentoDoMes(lancamentos, perfil, { diasNoMes, diasConsiderados }) {
  const custo = custoPorKm(perfil);
  // Dias antigos sem a separação guardada: estima a parte fixa pela proporção atual.
  const parteFixa = custo.total_km > 0 ? custo.fixo_km / custo.total_km : 0;
  const dias = lancamentos.map((l) => ({ ...l, ...indicadoresDoDia(l) }));
  const soma = (f) => dias.reduce((acc, d) => acc + f(d), 0);

  const fixosDescontados = soma((d) => d.km_rodados * (d.fixo_km_aplicado ?? d.custo_km_aplicado * parteFixa));
  const fracao = diasConsiderados / diasNoMes;
  const custosFixosPeriodo = perfil.custos_fixos_mensais * fracao;
  const diferenca = fixosDescontados - custosFixosPeriodo;
  const lucroDias = soma((d) => d.lucro);

  return {
    dias_no_mes: diasNoMes,
    dias_considerados: diasConsiderados,
    dias_lancados: dias.length,
    bruto: arred(soma((d) => d.bruto)),
    km_rodados: arred(soma((d) => d.km_rodados), 0),
    km_previsto: arred(perfil.km_mensal_estimado * fracao, 0),
    custos_fixos_mes: arred(perfil.custos_fixos_mensais),
    custos_fixos_periodo: arred(custosFixosPeriodo),
    fixos_descontados: arred(fixosDescontados),
    diferenca: arred(diferenca),
    lucro_dias: arred(lucroDias),
    lucro_ajustado: arred(lucroDias + diferenca),
  };
}
