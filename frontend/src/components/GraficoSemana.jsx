import { useState } from 'react';
import { moeda, numeroBR, diaCurto, dataBR } from '../util.js';
import KmIcon from './KmIcon.jsx';

// Gráfico de barras simples (sem biblioteca): barra clara = ganho bruto, parte verde = lucro.
// Tocar (ou passar o mouse) numa barra mostra os números daquele dia logo abaixo.
export default function GraficoSemana({ dias, meta, onAbrirDia }) {
  const [selecionado, setSelecionado] = useState(null);
  const [sobre, setSobre] = useState(null);
  const ativo = sobre ?? selecionado;
  const dia = dias.find((d) => d.data === ativo);
  const maior = Math.max(...dias.map((d) => d.bruto), meta || 0, 1);

  return (
    <div className={`grafico ${ativo ? 'grafico--foco' : ''}`}>
      <div className="grafico__barras" onMouseLeave={() => setSobre(null)}>
        {meta > 0 && <div className="grafico__meta" style={{ bottom: `${(meta / maior) * 100}%` }} title={`Meta ${moeda(meta)}`} />}
        {dias.map((d, i) => (
          <button
            type="button"
            key={d.data}
            className={`grafico__coluna ${d.data === ativo ? 'grafico__coluna--ativa' : ''}`}
            aria-pressed={d.data === selecionado}
            aria-label={`${dataBR(d.data)}: ${d.lancado ? `lucro ${moeda(d.lucro)}` : 'sem lançamento'}`}
            onClick={() => setSelecionado((s) => (s === d.data ? null : d.data))}
            onMouseEnter={() => setSobre(d.data)}
          >
            <span
              className={`grafico__bruto ${d.bruto ? '' : 'grafico__bruto--vazio'}`}
              style={{ height: `${(d.bruto / maior) * 100}%`, animationDelay: `${i * 60}ms` }}
            >
              {d.data === ativo && d.lancado && <span className="grafico__rotulo">{moeda(d.lucro)}</span>}
              <span
                className={`grafico__lucro ${d.lucro < 0 ? 'grafico__lucro--neg' : ''}`}
                style={{ height: d.bruto ? `${(Math.max(d.lucro, 0) / d.bruto) * 100}%` : 0 }}
              />
            </span>
          </button>
        ))}
      </div>
      <div className="grafico__eixo">
        {dias.map((d) => (
          <span key={d.data} className={d.data === ativo ? 'ativo' : ''}>{diaCurto(d.data)}</span>
        ))}
      </div>

      {dia ? (
        <div className="grafico__detalhe" key={dia.data}>
          <p className="grafico__detalhe-data">{dataBR(dia.data)}</p>
          {dia.lancado ? (
            <>
              <dl>
                <div><dt>Bruto</dt><dd>{moeda(dia.bruto)}</dd></div>
                <div><dt>Custos</dt><dd>−{moeda(dia.custo_total)}</dd></div>
                <div><dt>Lucro</dt><dd className={dia.lucro < 0 ? 'neg' : 'pos'}>{moeda(dia.lucro)}</dd></div>
                <div><dt>Km</dt><dd>{numeroBR(dia.km_rodados)}</dd></div>
              </dl>
              <button type="button" className="link-botao" onClick={() => onAbrirDia(dia.data)}>
                <KmIcon name="editar" size={18} /> Ver e editar o dia
              </button>
            </>
          ) : (
            <button type="button" className="link-botao" onClick={() => onAbrirDia(dia.data)}>
              <KmIcon name="lancar" size={18} /> Sem lançamento. Lançar este dia
            </button>
          )}
        </div>
      ) : (
        <p className="grafico__dica">Toque numa barra para ver os números do dia.</p>
      )}

      <div className="grafico__legenda">
        <span><i className="leg leg--lucro" /> Lucro</span>
        <span><i className="leg leg--bruto" /> Ganho bruto</span>
        {meta > 0 && <span><i className="leg leg--meta" /> Meta</span>}
      </div>
    </div>
  );
}
