import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO } from '../util.js';
import KmIcon from './KmIcon.jsx';

// "2026-10" -> "outubro de 2026"; e soma meses a um "AAAA-MM".
const nomeMes = (mes) => new Date(`${mes}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const somarMes = (mes, n) => {
  const [a, m] = mes.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};

// Fechamento do mês: o custo por km rateia os custos fixos pelos km previstos. Aqui o motorista vê
// se os dias lançados cobriram de fato os custos fixos do período e o lucro do mês ajustado.
export default function FechamentoMes() {
  const mesAtual = hojeISO().slice(0, 7);
  const [mes, setMes] = useState(mesAtual);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let atual = true;
    setErro('');
    api.fechamento(mes, hojeISO())
      .then((d) => atual && setDados(d))
      .catch((e) => atual && setErro(e.message));
    return () => { atual = false; };
  }, [mes]);

  const d = dados && dados.mes === mes ? dados : null;
  const cobertura = d && d.custos_fixos_periodo > 0 ? Math.min(d.fixos_descontados / d.custos_fixos_periodo, 1) : 1;

  return (
    <section className="cartao fechamento">
      <div className="fechamento__topo">
        <h2 className="cartao__titulo"><KmIcon name="custos-fixos" size={20} /> Fechamento do mês</h2>
        <div className="fechamento__nav">
          <button type="button" className="icone-botao" onClick={() => setMes((m) => somarMes(m, -1))} disabled={!!d?.primeiro_mes && mes <= d.primeiro_mes} aria-label="Mês anterior">‹</button>
          <span>{nomeMes(mes)}</span>
          <button type="button" className="icone-botao" onClick={() => setMes((m) => somarMes(m, 1))} disabled={mes >= mesAtual} aria-label="Próximo mês">›</button>
        </div>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {!d && !erro && <p className="carregando">Carregando…</p>}
      {d?.sem_uso && <p className="nota">Nenhum dia lançado {d.primeiro_mes ? 'neste mês: você começou a usar o KM Real depois dele.' : 'ainda. O fechamento aparece a partir do primeiro dia lançado.'}</p>}
      {d && !d.sem_uso && (
        <>
          <p className="fechamento__periodo">
            {d.dia_inicio > 1 ? `Desde o dia ${d.dia_inicio}, quando você começou` : d.mes_atual ? 'Até hoje' : 'Mês completo'}: {d.dias_considerados} de {d.dias_no_mes} dias · {d.dias_lancados} {d.dias_lancados === 1 ? 'dia lançado' : 'dias lançados'}
          </p>
          <dl className="linhas">
            <div><dt>Lucro estimado dos dias</dt><dd className={d.lucro_dias < 0 ? 'neg' : ''}>{moeda(d.lucro_dias)}</dd></div>
            <div>
              <dt>Custos fixos {d.dias_considerados < d.dias_no_mes ? 'do período' : 'do mês'}<small>{moeda(d.custos_fixos_mes)} por mês{d.dias_considerados < d.dias_no_mes ? ` × ${d.dias_considerados}/${d.dias_no_mes} dias` : ''}</small></dt>
              <dd>{moeda(d.custos_fixos_periodo)}</dd>
            </div>
            <div>
              <dt>Já descontados nos dias<small>{numeroBR(d.km_rodados)} de {numeroBR(d.km_previsto)} km previstos</small></dt>
              <dd>{moeda(d.fixos_descontados)}</dd>
            </div>
          </dl>
          <div className="fechamento__barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(cobertura * 100)} aria-label="Custos fixos cobertos">
            <span style={{ width: `${cobertura * 100}%` }} />
          </div>
          <dl className="linhas">
            <div className="linhas__total"><dt>Lucro do mês, ajustado</dt><dd className={d.lucro_ajustado < 0 ? 'neg' : 'pos'}>{moeda(d.lucro_ajustado)}</dd></div>
          </dl>
          <p className="nota">
            {d.diferenca < -0.5 && `Você rodou menos que o previsto: faltam ${moeda(-d.diferenca)} de custos fixos, que saem do lucro.`}
            {d.diferenca > 0.5 && `Você rodou mais que o previsto: os dias descontaram ${moeda(d.diferenca)} a mais de custos fixos, que voltam para o lucro.`}
            {Math.abs(d.diferenca) <= 0.5 && 'Os dias cobriram certinho os custos fixos do período.'}
          </p>
        </>
      )}
    </section>
  );
}
