// Dados de exemplo para demonstração: um motorista e os dias do mês até ontem.
// Usado pelo seed do banco e pela versão que roda só no navegador (GitHub Pages).
import { custoPorKm, custosFixosMensais, kmMensal } from './calculos.js';

export function perfilExemplo() {
  const perfil = {
    nome: 'Carlos',
    apps: 'uber,99',
    meta_diaria: 180,
    modelo_veiculo: 'Onix 1.0 2020',
    // Carro flex: abastece com gasolina hoje, mas também usa etanol.
    combustiveis: 'gasolina,etanol',
    combustivel_padrao: 'gasolina',
    preco_gasolina: 6.29,
    consumo_gasolina: 12,
    preco_etanol: 4.19,
    consumo_etanol: 8.5,
    consumo_km_l: 12, // os do combustível padrão
    preco_combustivel: 6.29,
    km_por_dia: 190,
    dias_por_semana: 6,
    custo_parcela: 800,
    custo_seguro: 2160, // pago à vista: R$ 2.160 por ano (R$ 180 por mês)
    custo_seguro_periodo: 'ano',
    custo_ipva: 1800, // por ano
    custo_manutencao: 200,
    custo_manutencao_periodo: 'mes',
    custo_depreciacao: 0, // carro financiado: a parcela já cobre a perda de valor
    custo_outros: 120, // rastreador e internet do celular
  };
  perfil.custos_fixos_mensais = custosFixosMensais(perfil);
  perfil.km_mensal_estimado = kmMensal(perfil);
  return perfil;
}

// Do dia 1 do mês até ontem (no mínimo 13 dias), para o gráfico e o fechamento do mês terem dados.
export function lancamentosExemplo(perfil, hoje = new Date()) {
  const custo = custoPorKm(perfil);
  const dias = [];
  const diasAtras = Math.max(13, hoje.getDate() - 1);
  for (let i = diasAtras; i >= 1; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) continue; // folga no domingo
    const km = 150 + Math.round(Math.random() * 90);
    dias.push({
      data: d.toLocaleDateString('sv-SE'), // AAAA-MM-DD no fuso local
      ganho_uber: Math.round(km * (1.1 + Math.random() * 0.6)),
      ganho_99: Math.round(km * (0.3 + Math.random() * 0.4)),
      ganho_outros: 0,
      km_rodados: km,
      horas_trabalhadas: 8 + Math.round(Math.random() * 3),
      gastos_extras: Math.round(Math.random() * 40),
      custo_km_aplicado: custo.total_km,
      combustivel_km_aplicado: custo.combustivel_km,
      fixo_km_aplicado: custo.fixo_km,
      combustivel_tipo: perfil.combustivel_padrao,
      preco_litro_aplicado: perfil.preco_combustivel,
      consumo_aplicado: perfil.consumo_km_l,
      observacao: null,
    });
  }
  return dias;
}
