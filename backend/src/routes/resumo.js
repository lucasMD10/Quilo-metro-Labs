import { Router } from 'express';
import { db } from '../db.js';
import { indicadoresDoDia, totalizar, fechamentoDoMes } from '../calculos.js';
import { dataISO, erro } from '../validacao.js';
import { buscarPerfil } from './perfil.js';

export const resumoRouter = Router();

// Soma dias a uma data AAAA-MM-DD sem problemas de fuso horário.
function somarDias(iso, dias) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// GET /api/resumo?ate=AAAA-MM-DD&dias=7
// O front manda "ate" com a data local de hoje, assim o "hoje" é sempre o do motorista.
resumoRouter.get('/', (req, res) => {
  const ate = req.query.ate ? dataISO(req.query.ate) : new Date().toISOString().slice(0, 10);
  const qtd = Math.min(Math.max(Number(req.query.dias) || 7, 1), 31);
  const de = somarDias(ate, -(qtd - 1));

  const linhas = db.prepare('SELECT * FROM lancamentos WHERE data BETWEEN ? AND ?').all(de, ate);
  const porData = new Map(linhas.map((l) => [l.data, l]));

  // Monta todos os dias do período, inclusive os sem lançamento (para o gráfico).
  const dias = [];
  for (let i = 0; i < qtd; i++) {
    const data = somarDias(de, i);
    const l = porData.get(data);
    dias.push(
      l
        ? { data, lancado: true, km_rodados: l.km_rodados, horas_trabalhadas: l.horas_trabalhadas, ...indicadoresDoDia(l) }
        : { data, lancado: false, km_rodados: 0, horas_trabalhadas: 0, bruto: 0, custo_total: 0, lucro: 0 }
    );
  }

  const perfil = buscarPerfil();
  const meta = perfil?.meta_diaria || 0;
  const hoje = dias[dias.length - 1];

  res.json({
    periodo: { de, ate, dias: qtd },
    meta_diaria: meta,
    hoje: { ...hoje, falta_para_meta: Math.max(meta - hoje.lucro, 0), meta_batida: meta > 0 && hoje.lucro >= meta },
    dias,
    totais: totalizar(dias),
    dias_meta_batida: meta > 0 ? dias.filter((d) => d.lancado && d.lucro >= meta).length : 0,
  });
});

// GET /api/resumo/mes?mes=AAAA-MM&hoje=AAAA-MM-DD -> fechamento do mês (custos fixos previstos x cobertos)
// "hoje" vem do front (data do aparelho): no mês atual, o fechamento considera só os dias até hoje.
resumoRouter.get('/mes', (req, res) => {
  const hoje = req.query.hoje ? dataISO(req.query.hoje) : new Date().toISOString().slice(0, 10);
  const mes = req.query.mes || hoje.slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) throw erro('Mês inválido. Use o formato AAAA-MM.');
  if (mes > hoje.slice(0, 7)) throw erro('Esse mês ainda não começou.');

  const perfil = buscarPerfil();
  if (!perfil) throw erro('Cadastre seu veículo antes de ver o fechamento.', 409);

  const [ano, m] = mes.split('-').map(Number);
  const diasNoMes = new Date(Date.UTC(ano, m, 0)).getUTCDate();
  const mesAtual = mes === hoje.slice(0, 7);
  // Os custos fixos só contam a partir do primeiro dia lançado no app: quem começou no dia 14
  // não "deve" os custos dos dias 1 a 13, e meses anteriores ao primeiro uso ficam de fora.
  const primeiro = db.prepare('SELECT MIN(data) AS data FROM lancamentos').get().data;
  if (!primeiro || mes < primeiro.slice(0, 7)) return res.json({ mes, mes_atual: mesAtual, sem_uso: true, primeiro_mes: primeiro?.slice(0, 7) || null });

  const inicio = primeiro.slice(0, 7) === mes ? Number(primeiro.slice(8, 10)) : 1;
  const fim = mesAtual ? Number(hoje.slice(8, 10)) : diasNoMes;
  const diasConsiderados = Math.max(fim - inicio + 1, 0);
  const lancamentos = db.prepare('SELECT * FROM lancamentos WHERE data BETWEEN ? AND ? ORDER BY data').all(`${mes}-01`, `${mes}-31`);

  res.json({
    mes, mes_atual: mesAtual, primeiro_mes: primeiro.slice(0, 7), dia_inicio: inicio,
    ...fechamentoDoMes(lancamentos, perfil, { diasNoMes, diasConsiderados }),
  });
});
