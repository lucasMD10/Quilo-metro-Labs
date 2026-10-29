// Versão da API que roda inteira no navegador (GitHub Pages): mesmas respostas das rotas do backend,
// com os dados guardados no localStorage do aparelho. Não há regra própria aqui: validações e contas
// vêm dos mesmos módulos do backend (regras.js e calculos.js).
import { indicadoresDoDia, totalizar, fechamentoDoMes } from '../../backend/src/calculos.js';
import { dataISO, erro } from '../../backend/src/validacao.js';
import { dadosPerfil, perfilCompleto, previaVeiculo, dadosLancamento, previaLancamento, progressoMeta } from '../../backend/src/regras.js';
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
  const perfil = { id: 1, ...dadosPerfil(b) };
  gravar({ ...ler(), perfil });
  return perfilCompleto(perfil);
}

function lancamento(dataBruta) {
  const l = ler().lancamentos[dataISO(dataBruta)];
  if (!l) throw erro('Nenhum lançamento nesse dia.', 404);
  return comIndicadores(l);
}

function salvarLancamento(dataBruta, b = {}) {
  const dados = ler();
  const data = dataISO(dataBruta);
  const dia = dadosLancamento(b, { data, perfil: dados.perfil, existente: dados.lancamentos[data] });
  gravar({ ...dados, lancamentos: { ...dados.lancamentos, [data]: dia } });
  return comIndicadores(dia);
}

function previaDoDia(b = {}) {
  const { perfil, lancamentos } = ler();
  const existente = b.data ? lancamentos[dataISO(b.data)] : null;
  return previaLancamento(b, { perfil, existente });
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
    hoje: { ...hoje, ...progressoMeta(hoje.lucro, meta) },
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
  return perfilCompleto(perfil);
}

// Mesma interface do api.js: tudo devolve Promise, e os erros carregam .status.
const assincrono = (fn) => (...args) => new Promise((resolve) => resolve(fn(...args)));

export const apiNavegador = {
  perfil: assincrono(() => perfilCompleto(ler().perfil)),
  salvarPerfil: assincrono(salvarPerfil),
  previaVeiculo: assincrono(previaVeiculo),
  resumo: assincrono(resumo),
  fechamento: assincrono(fechamento),
  lancamentos: assincrono(() => Object.values(ler().lancamentos).sort((a, b) => b.data.localeCompare(a.data)).map(comIndicadores)),
  lancamento: assincrono(lancamento),
  previaLancamento: assincrono(previaDoDia),
  salvarLancamento: assincrono(salvarLancamento),
  excluirLancamento: assincrono(excluirLancamento),
  carregarExemplo: assincrono(carregarExemplo),
};
