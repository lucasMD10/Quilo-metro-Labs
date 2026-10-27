// Regras de negócio do KM Real. Funções puras: recebem números, devolvem números.
// Ficam separadas das rotas para serem fáceis de testar e de explicar na banca.

const arred = (valor, casas = 2) => Math.round(valor * 10 ** casas) / 10 ** casas;

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
