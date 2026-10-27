import { Router } from 'express';
import { db } from '../db.js';
import { indicadoresDoDia, totalizar } from '../calculos.js';
import { dataISO } from '../validacao.js';
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
