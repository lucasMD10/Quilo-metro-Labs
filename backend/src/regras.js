// Regras de negócio do KM Real: validação dos dados e prévias de cálculo.
// Tudo que decide valores fica aqui (e em calculos.js); as rotas só chamam estas funções
// e o front só mostra o que elas devolvem.
import { SEMANAS_POR_MES, custoPorKm, custosFixosMensais, kmMensal } from './calculos.js';
import { numero, dataISO, erro } from './validacao.js';

const arred = (valor, casas = 2) => Math.round(valor * 10 ** casas) / 10 ** casas;
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (v, casas = 0) => v.toLocaleString('pt-BR', { maximumFractionDigits: casas });
const texto = (v, max, campo) => {
  const t = String(v || '').trim();
  if (t.length > max) throw erro(`${campo} pode ter no máximo ${max} caracteres.`);
  return t;
};

// Data de hoje no fuso do computador que roda a API (o mesmo do motorista).
export const hojeLocal = () => new Date().toLocaleDateString('sv-SE');

// Limites para pegar erro de digitação (um zero a mais) antes de gravar.
export const LIMITES = { ganhoPorApp: 10000, gastosDia: 5000, kmDia: 1500, horasDia: 24, custoFixo: 100000 };

// Combustíveis aceitos. Aditivada é gasolina (muda só o preço); GNV fica para depois.
export const COMBUSTIVEIS = ['gasolina', 'etanol'];
const DO = { gasolina: 'da gasolina', etanol: 'do etanol' };
const COM = { gasolina: 'com gasolina', etanol: 'com etanol' };
const listaCombustiveis = (v) => [...new Set(String(v || '').split(','))].filter((c) => COMBUSTIVEIS.includes(c));

/**
 * Lê os combustíveis do carro: quais usa, preço e consumo de cada um e qual é o padrão agora.
 * O padrão vira preco_combustivel/consumo_km_l, que é o que as contas usam.
 * Pedidos sem esses campos (versão antiga) são tratados como "só gasolina".
 */
function dadosCombustivel(b) {
  const antigo = b.combustiveis === undefined && b.preco_gasolina === undefined && b.preco_etanol === undefined;
  const f = antigo
    ? { combustiveis: 'gasolina', combustivel_padrao: 'gasolina', preco_gasolina: b.preco_combustivel, consumo_gasolina: b.consumo_km_l }
    : b;
  const lista = listaCombustiveis(f.combustiveis);
  if (!lista.length) throw erro('Escolha pelo menos um combustível.');

  const dados = { combustiveis: lista.join(',') };
  for (const c of COMBUSTIVEIS) {
    const usa = lista.includes(c);
    dados[`preco_${c}`] = usa ? numero(f[`preco_${c}`], { campo: `o preço do litro ${DO[c]}`, obrigatorio: true, maiorQueZero: true, max: 50 }) : null;
    dados[`consumo_${c}`] = usa ? numero(f[`consumo_${c}`], { campo: `quantos km o carro faz por litro ${COM[c]}`, obrigatorio: true, maiorQueZero: true, max: 100 }) : null;
  }
  const padrao = lista.length === 1 ? lista[0] : f.combustivel_padrao;
  if (!lista.includes(padrao)) throw erro('Escolha com qual combustível você está abastecendo agora.');
  dados.combustivel_padrao = padrao;
  dados.preco_combustivel = dados[`preco_${padrao}`];
  dados.consumo_km_l = dados[`consumo_${padrao}`];
  return dados;
}

/** Valida o perfil recebido e calcula os totais do mês. */
export function dadosPerfil(b = {}) {
  const nome = texto(b.nome, 60, 'O nome');
  if (!nome) throw erro('Informe seu nome.');

  const dias = numero(b.dias_por_semana, { campo: 'os dias por semana', obrigatorio: true, maiorQueZero: true });
  if (dias > 7) throw erro('Os dias por semana vão de 1 a 7.');

  // Só Uber e 99, sem repetir. Nenhum app marcado é erro.
  const apps = b.apps === undefined ? ['uber', '99'] : [...new Set(String(b.apps).split(','))].filter((a) => a === 'uber' || a === '99');
  if (!apps.length) throw erro('Escolha pelo menos um app.');

  const custo = (v, campo) => numero(v, { campo, max: LIMITES.custoFixo });
  const periodo = (v, campo) => {
    if (v === undefined || v === null || v === '') return 'mes';
    if (v !== 'mes' && v !== 'ano') throw erro(`Informe se ${campo} é por mês ou por ano.`);
    return v;
  };
  const dados = {
    nome,
    apps: apps.join(','),
    meta_diaria: numero(b.meta_diaria, { campo: 'a meta diária', max: 10000 }),
    modelo_veiculo: texto(b.modelo_veiculo, 60, 'O modelo do carro') || null,
    ...dadosCombustivel(b),
    km_por_dia: numero(b.km_por_dia, { campo: 'quantos km você roda por dia', obrigatorio: true, maiorQueZero: true, max: LIMITES.kmDia }),
    dias_por_semana: dias,
    custo_parcela: custo(b.custo_parcela, 'a parcela ou aluguel'),
    custo_seguro: custo(b.custo_seguro, 'o seguro'),
    custo_seguro_periodo: periodo(b.custo_seguro_periodo, 'o seguro'),
    custo_ipva: custo(b.custo_ipva, 'o IPVA'),
    custo_manutencao: custo(b.custo_manutencao, 'a manutenção'),
    custo_manutencao_periodo: periodo(b.custo_manutencao_periodo, 'a manutenção'),
    custo_depreciacao: custo(b.custo_depreciacao, 'a reserva para trocar de carro'),
    custo_outros: custo(b.custo_outros, 'os outros custos'),
  };
  dados.custos_fixos_mensais = custosFixosMensais(dados);
  dados.km_mensal_estimado = kmMensal(dados);
  return dados;
}

/**
 * Perfil como o front recebe: com o custo por km. Perfis antigos só têm o total dos custos e os km do mês:
 * o total vai para "Outros" e os km por dia são estimados a partir do mês.
 */
export function perfilCompleto(perfil) {
  if (!perfil) return null;
  const p = { ...perfil };
  if (p.combustiveis == null) {
    // Perfil gravado antes de existir gasolina/etanol: o combustível que ele tinha é gasolina.
    Object.assign(p, { combustiveis: 'gasolina', combustivel_padrao: 'gasolina', preco_gasolina: p.preco_combustivel, consumo_gasolina: p.consumo_km_l, preco_etanol: null, consumo_etanol: null });
  }
  if (p.km_por_dia == null) {
    const dias = p.dias_por_semana || 6;
    p.dias_por_semana = dias;
    p.km_por_dia = Math.round(p.km_mensal_estimado / (dias * SEMANAS_POR_MES));
    p.custo_outros = p.custos_fixos_mensais;
  }
  return { ...p, custo: custoPorKm(p) };
}

/** Avisos para valores que provavelmente foram digitados errado (não bloqueiam o cadastro). */
// Faixas para avisar de provável erro de digitação (não bloqueiam o cadastro).
const FAIXAS = { gasolina: { consumo: [5, 25], preco: [3, 10] }, etanol: { consumo: [4, 20], preco: [2, 8] } };

function avisosVeiculo(p, totalKm) {
  const avisos = [];
  for (const c of listaCombustiveis(p.combustiveis)) {
    const consumo = p[`consumo_${c}`];
    const preco = p[`preco_${c}`];
    const faixa = FAIXAS[c];
    if (consumo && (consumo < faixa.consumo[0] || consumo > faixa.consumo[1])) {
      avisos.push(`${num(consumo, 1)} km por litro ${COM[c]} parece fora do normal. Confira no painel do carro.`);
    }
    if (preco && (preco < faixa.preco[0] || preco > faixa.preco[1])) {
      avisos.push(`${brl(preco)} o litro ${DO[c]} parece fora do normal. Confira o preço que você paga no posto.`);
    }
  }
  if (p.km_por_dia && p.km_por_dia < 40) {
    avisos.push(`Só ${num(p.km_por_dia)} km por dia? Motoristas de app costumam rodar de 100 a 250 km. Com poucos km, os custos fixos pesam muito em cada km.`);
  }
  if (p.km_por_dia > 600) {
    avisos.push(`${num(p.km_por_dia)} km por dia é muita coisa. Confira se não digitou os km do mês.`);
  }
  if (totalKm > 2) {
    avisos.push('Seu custo por km ficou alto. Confira os valores acima: um número errado aqui muda o lucro de todos os dias.');
  }
  return avisos;
}

/**
 * Prévia do custo do carro enquanto o motorista preenche o perfil (nada é gravado).
 * Campos vazios ou inválidos contam como zero: a validação de verdade acontece ao salvar.
 */
export function previaVeiculo(b = {}) {
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) && x > 0 ? x : 0;
  };
  // Combustíveis: os marcados, cada um com preço e consumo; o padrão é o que entra na conta.
  const antigo = b.combustiveis === undefined && b.preco_gasolina === undefined && b.preco_etanol === undefined;
  const lista = antigo ? ['gasolina'] : listaCombustiveis(b.combustiveis);
  const comb = { combustiveis: lista.join(',') };
  for (const c of COMBUSTIVEIS) {
    comb[`preco_${c}`] = lista.includes(c) ? n(antigo ? b.preco_combustivel : b[`preco_${c}`]) : 0;
    comb[`consumo_${c}`] = lista.includes(c) ? n(antigo ? b.consumo_km_l : b[`consumo_${c}`]) : 0;
  }
  const padrao = lista.length === 1 ? lista[0] : lista.includes(b.combustivel_padrao) ? b.combustivel_padrao : lista[0];
  const porKm = (c) => (comb[`consumo_${c}`] > 0 ? comb[`preco_${c}`] / comb[`consumo_${c}`] : 0);
  const p = {
    ...comb,
    consumo_km_l: padrao ? comb[`consumo_${padrao}`] : 0, preco_combustivel: padrao ? comb[`preco_${padrao}`] : 0, km_por_dia: n(b.km_por_dia),
    dias_por_semana: n(b.dias_por_semana), meta_diaria: n(b.meta_diaria),
    custo_parcela: n(b.custo_parcela), custo_seguro: n(b.custo_seguro), custo_ipva: n(b.custo_ipva),
    custo_manutencao: n(b.custo_manutencao), custo_depreciacao: n(b.custo_depreciacao), custo_outros: n(b.custo_outros),
    custo_seguro_periodo: b.custo_seguro_periodo === 'ano' ? 'ano' : 'mes',
    custo_manutencao_periodo: b.custo_manutencao_periodo === 'ano' ? 'ano' : 'mes',
  };
  const custosMes = custosFixosMensais(p);
  const kmMes = kmMensal(p);
  const combustivel = p.consumo_km_l > 0 ? p.preco_combustivel / p.consumo_km_l : 0;
  const fixo = kmMes > 0 ? custosMes / kmMes : 0;
  const total = combustivel + fixo;
  // Com os dois combustíveis preenchidos, diz qual sai mais barato por km rodado.
  const porCombustivel = Object.fromEntries(lista.filter((c) => porKm(c) > 0).map((c) => [c, arred(porKm(c), 4)]));
  const comparacao = porCombustivel.gasolina && porCombustivel.etanol
    ? { mais_barato: porCombustivel.etanol < porCombustivel.gasolina ? 'etanol' : 'gasolina', diferenca_km: arred(Math.abs(porCombustivel.etanol - porCombustivel.gasolina), 4) }
    : null;
  return {
    combustivel_padrao: padrao || null,
    combustivel_por_km: porCombustivel,
    comparacao,
    combustivel_km: arred(combustivel, 4),
    fixo_km: arred(fixo, 4),
    total_km: arred(total, 4),
    custos_fixos_mensais: custosMes,
    km_mensal: kmMes,
    custo_100km: arred(total * 100),
    combustivel_mes: arred(combustivel * kmMes),
    total_mes: arred(total * kmMes),
    // Quanto faturar num dia normal para sobrar a meta.
    faturamento_meta: p.meta_diaria > 0 && p.km_por_dia > 0 ? arred(p.meta_diaria + p.km_por_dia * total) : null,
    avisos: avisosVeiculo(p, total),
  };
}

/** Custo por km que vale para um dia: o congelado no lançamento, a não ser que o motorista peça para recalcular. */
function custoDoDia(perfil, existente, recalcular) {
  const atual = custoPorKm(perfil);
  if (existente && !recalcular) {
    return { total_km: existente.custo_km_aplicado, combustivel_km: existente.combustivel_km_aplicado, fixo_km: existente.fixo_km_aplicado };
  }
  return atual;
}

/** Lê e valida os campos de um dia. Usado para gravar e para a prévia. */
function camposDoDia(b) {
  const horas = numero(b.horas_trabalhadas, { campo: 'as horas online' });
  if (horas > LIMITES.horasDia) throw erro('Um dia tem no máximo 24 horas. Confira as horas online.');
  const km = numero(b.km_rodados, { campo: 'os km rodados' });
  if (km > LIMITES.kmDia) throw erro('Mais de 1.500 km num dia não parece real. Confira os km rodados.');
  return {
    ganho_uber: numero(b.ganho_uber, { campo: 'o ganho na Uber', max: LIMITES.ganhoPorApp }),
    ganho_99: numero(b.ganho_99, { campo: 'o ganho na 99', max: LIMITES.ganhoPorApp }),
    ganho_outros: numero(b.ganho_outros, { campo: 'outros ganhos', max: LIMITES.ganhoPorApp }),
    km_rodados: km,
    horas_trabalhadas: horas,
    gastos_extras: numero(b.gastos_extras, { campo: 'os outros gastos', max: LIMITES.gastosDia }),
  };
}

/**
 * Prévia do dia enquanto o motorista digita (nada é gravado). Devolve a conta aberta e
 * se o custo por km congelado no dia é diferente do custo de hoje.
 */
export function previaLancamento(b = {}, { perfil, existente }) {
  if (!perfil) throw erro('Cadastre seu veículo antes de lançar um dia.', 409);
  const campos = camposDoDia(b);
  const atual = custoPorKm(perfil);
  const custo = custoDoDia(perfil, existente, b.recalcular_custo);
  const semSeparacao = custo.combustivel_km == null; // dia lançado antes de existir a separação
  const bruto = campos.ganho_uber + campos.ganho_99 + campos.ganho_outros;
  const combustivel = campos.km_rodados * (semSeparacao ? custo.total_km : custo.combustivel_km);
  const fixo = semSeparacao ? 0 : campos.km_rodados * custo.fixo_km;
  return {
    bruto: arred(bruto),
    combustivel: arred(combustivel),
    fixo: arred(fixo),
    gastos: arred(campos.gastos_extras),
    lucro: arred(bruto - combustivel - fixo - campos.gastos_extras),
    custo,
    custo_atual: atual,
    sem_separacao: semSeparacao,
    custo_mudou: !!existente && Math.abs(existente.custo_km_aplicado - atual.total_km) >= 0.005,
  };
}

/**
 * Valida um dia para gravar. Valores suspeitos pedem confirmação: a API responde 422 com a pergunta
 * e o front reenvia com confirmado: true se o motorista concordar.
 */
export function dadosLancamento(b = {}, { data: dataBruta, perfil, existente, hoje = hojeLocal() }) {
  if (!perfil) throw erro('Cadastre seu veículo antes de lançar um dia.', 409);
  const data = dataISO(dataBruta);
  if (data > hoje) throw erro('Não dá para lançar um dia que ainda não chegou.');

  const campos = camposDoDia(b);
  if (Object.values(campos).every((v) => !v)) throw erro('O dia está vazio. Preencha pelo menos os ganhos ou os km rodados.');

  const bruto = campos.ganho_uber + campos.ganho_99 + campos.ganho_outros;
  if (!b.confirmado) {
    const pergunta = bruto > 2000
      ? `Ganho de ${brl(bruto)} num dia só. O valor está certo?`
      : bruto > 0 && !campos.km_rodados
        ? 'Você lançou ganhos sem km rodados, então nenhum custo do carro será descontado. Salvar assim mesmo?'
        : null;
    if (pergunta) {
      const e = erro(pergunta, 422);
      e.confirmar = true;
      throw e;
    }
  }

  // O custo por km fica "congelado" no dia em que foi lançado: editar um dia antigo não muda o lucro dele
  // só porque a gasolina subiu. O motorista pode pedir para recalcular com o custo atual (recalcular_custo).
  const custo = custoDoDia(perfil, existente, b.recalcular_custo);
  return {
    data,
    ...campos,
    custo_km_aplicado: custo.total_km,
    combustivel_km_aplicado: custo.combustivel_km,
    fixo_km_aplicado: custo.fixo_km,
    observacao: texto(b.observacao, 300, 'A observação') || null,
  };
}

/** Progresso do lucro até a meta (0 a 1), quanto falta e se bateu. */
export function progressoMeta(lucro, meta) {
  if (!meta) return { meta_pct: 0, falta_para_meta: 0, meta_batida: false };
  return {
    meta_pct: arred(Math.max(0, Math.min(lucro / meta, 1)), 4),
    falta_para_meta: arred(Math.max(meta - lucro, 0)),
    meta_batida: lucro >= meta,
  };
}

