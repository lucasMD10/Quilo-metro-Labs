// Versão da API que roda inteira no navegador (GitHub Pages): mesmas respostas das rotas do backend,
// com os dados guardados no localStorage do aparelho. As regras de cálculo são as mesmas do backend.
import { custoPorKm, custosFixosMensais, kmMensal, indicadoresDoDia, totalizar, fechamentoDoMes } from '../../backend/src/calculos.js';
import { numero, dataISO, erro } from '../../backend/src/validacao.js';
import { perfilExemplo, lancamentosExemplo } from '../../backend/src/exemplo.js';

const CHAVE = 'km-real:v1';

function ler() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && typeof salvo === 'object') return { perfil: salvo.perfil || null, lancamentos: salvo.lancamentos || {} };
  } catch { /* sem armazenamento: começa vazio */ }
  return { perfil: null, lancamentos: {} };
}

function gravar(dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    throw erro('Não foi possível salvar neste navegador. Confira se ele não está em modo anônimo.', 500);
  }
}

const comCusto = (perfil) => (perfil ? { ...perfil, custo: custoPorKm(perfil) } : null);
const comIndicadores = (l) => ({ ...l, ...indicadoresDoDia(l) });
const hojeUTC = () => new Date().toISOString().slice(0, 10);

function somarDias(iso, dias) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function entre(lancamentos, de, ate) {
  return Object.values(lancamentos).filter((l) => l.data >= de && l.data <= ate);
}

function salvarPerfil(b = {}) {
  const nome = String(b.nome || '').trim();
  if (!nome) throw erro('Informe seu nome.');

  const dias = numero(b.dias_por_semana, { campo: 'os dias por semana', obrigatorio: true, maiorQueZero: true });
  if (dias > 7) throw erro('Os dias por semana vão de 1 a 7.');

  const apps = b.apps === undefined ? ['uber', '99'] : [...new Set(String(b.apps).split(','))].filter((a) => a === 'uber' || a === '99');
  if (!apps.length) throw erro('Escolha pelo menos um app.');

  const perfil = {
    id: 1,
    nome,
    apps: apps.join(','),
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
    custo_depreciacao: numero(b.custo_depreciacao, { campo: 'a reserva para trocar de carro' }),
    custo_outros: numero(b.custo_outros, { campo: 'os outros custos' }),
  };
  perfil.custos_fixos_mensais = custosFixosMensais(perfil);
  perfil.km_mensal_estimado = kmMensal(perfil);

  const dados = ler();
  gravar({ ...dados, perfil });
  return comCusto(perfil);
}

function lancamento(dataBruta) {
  const l = ler().lancamentos[dataISO(dataBruta)];
  if (!l) throw erro('Nenhum lançamento nesse dia.', 404);
  return comIndicadores(l);
}

function salvarLancamento(dataBruta, b = {}) {
  const dados = ler();
  if (!dados.perfil) throw erro('Cadastre seu veículo antes de lançar um dia.', 409);
  const data = dataISO(dataBruta);

  // O custo por km fica "congelado" no dia em que foi lançado, como no backend.
  const existente = dados.lancamentos[data];
  const atual = custoPorKm(dados.perfil);
  const custo = existente && !b.recalcular_custo
    ? existente
    : { custo_km_aplicado: atual.total_km, combustivel_km_aplicado: atual.combustivel_km, fixo_km_aplicado: atual.fixo_km };

  const dia = {
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

  if (!dia.ganho_uber && !dia.ganho_99 && !dia.ganho_outros && !dia.km_rodados && !dia.horas_trabalhadas && !dia.gastos_extras) {
    throw erro('O dia está vazio. Preencha pelo menos os ganhos ou os km rodados.');
  }

  gravar({ ...dados, lancamentos: { ...dados.lancamentos, [data]: dia } });
  return comIndicadores(dia);
}

function excluirLancamento(dataBruta) {
  const dados = ler();
  const data = dataISO(dataBruta);
  if (!dados.lancamentos[data]) throw erro('Nenhum lançamento nesse dia.', 404);
  const { [data]: _, ...resto } = dados.lancamentos;
  gravar({ ...dados, lancamentos: resto });
  return null;
}

function resumo(ateBruto, qtdBruta) {
  const ate = ateBruto ? dataISO(ateBruto) : hojeUTC();
  const qtd = Math.min(Math.max(Number(qtdBruta) || 7, 1), 31);
  const de = somarDias(ate, -(qtd - 1));
  const { perfil, lancamentos } = ler();

  const dias = [];
  for (let i = 0; i < qtd; i++) {
    const data = somarDias(de, i);
    const l = lancamentos[data];
    dias.push(
      l
        ? { data, lancado: true, km_rodados: l.km_rodados, horas_trabalhadas: l.horas_trabalhadas, ...indicadoresDoDia(l) }
        : { data, lancado: false, km_rodados: 0, horas_trabalhadas: 0, bruto: 0, custo_total: 0, lucro: 0 }
    );
  }

  const meta = perfil?.meta_diaria || 0;
  const hoje = dias[dias.length - 1];
  return {
    periodo: { de, ate, dias: qtd },
    meta_diaria: meta,
    hoje: { ...hoje, falta_para_meta: Math.max(meta - hoje.lucro, 0), meta_batida: meta > 0 && hoje.lucro >= meta },
    dias,
    totais: totalizar(dias),
    dias_meta_batida: meta > 0 ? dias.filter((d) => d.lancado && d.lucro >= meta).length : 0,
  };
}

function fechamento(mesBruto, hojeBruto) {
  const hoje = hojeBruto ? dataISO(hojeBruto) : hojeUTC();
  const mes = mesBruto || hoje.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) throw erro('Mês inválido. Use o formato AAAA-MM.');
  if (mes > hoje.slice(0, 7)) throw erro('Esse mês ainda não começou.');

  const { perfil, lancamentos } = ler();
  if (!perfil) throw erro('Cadastre seu veículo antes de ver o fechamento.', 409);

  const [ano, m] = mes.split('-').map(Number);
  const diasNoMes = new Date(Date.UTC(ano, m, 0)).getUTCDate();
  const mesAtual = mes === hoje.slice(0, 7);
  const primeiro = Object.keys(lancamentos).sort()[0];
  if (!primeiro || mes < primeiro.slice(0, 7)) return { mes, mes_atual: mesAtual, sem_uso: true, primeiro_mes: primeiro?.slice(0, 7) || null };

  const inicio = primeiro.slice(0, 7) === mes ? Number(primeiro.slice(8, 10)) : 1;
  const fim = mesAtual ? Number(hoje.slice(8, 10)) : diasNoMes;
  const diasConsiderados = Math.max(fim - inicio + 1, 0);
  const doMes = entre(lancamentos, `${mes}-01`, `${mes}-31`).sort((a, b) => a.data.localeCompare(b.data));

  return {
    mes, mes_atual: mesAtual, primeiro_mes: primeiro.slice(0, 7), dia_inicio: inicio,
    ...fechamentoDoMes(doMes, perfil, { diasNoMes, diasConsiderados }),
  };
}

function carregarExemplo() {
  const perfil = { id: 1, ...perfilExemplo() };
  const lancamentos = Object.fromEntries(lancamentosExemplo(perfil).map((l) => [l.data, l]));
  gravar({ perfil, lancamentos });
  return comCusto(perfil);
}

// Mesma interface do api.js: tudo devolve Promise, e os erros carregam .status.
const assincrono = (fn) => (...args) => new Promise((resolve) => resolve(fn(...args)));

export const apiNavegador = {
  perfil: assincrono(() => comCusto(ler().perfil)),
  salvarPerfil: assincrono(salvarPerfil),
  resumo: assincrono(resumo),
  fechamento: assincrono(fechamento),
  lancamentos: assincrono(() => Object.values(ler().lancamentos).sort((a, b) => b.data.localeCompare(a.data)).map(comIndicadores)),
  lancamento: assincrono(lancamento),
  salvarLancamento: assincrono(salvarLancamento),
  excluirLancamento: assincrono(excluirLancamento),
  carregarExemplo: assincrono(carregarExemplo),
};
