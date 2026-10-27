import { moeda, diaCurto } from '../util.js';

// Gráfico de barras simples (sem biblioteca): contorno = ganho bruto, preenchimento = lucro.
export default function GraficoSemana({ dias, meta }) {
  const maior = Math.max(...dias.map((d) => d.bruto), meta || 0, 1);
  return (
    <div className="grafico">
      <div className="grafico__barras">
        {meta > 0 && <div className="grafico__meta" style={{ bottom: `${(meta / maior) * 100}%` }} title={`Meta ${moeda(meta)}`} />}
        {dias.map((d) => (
          <div key={d.data} className="grafico__coluna" title={`${d.data}: bruto ${moeda(d.bruto)}, lucro ${moeda(d.lucro)}`}>
            <div className={`grafico__bruto ${d.bruto ? "" : "grafico__bruto--vazio"}`} style={{ height: `${(d.bruto / maior) * 100}%` }}>
              <div
                className={`grafico__lucro ${d.lucro < 0 ? 'grafico__lucro--neg' : ''}`}
                style={{ height: d.bruto ? `${(Math.max(d.lucro, 0) / d.bruto) * 100}%` : 0 }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grafico__eixo">
        {dias.map((d) => (
          <span key={d.data}>{diaCurto(d.data)}</span>
        ))}
      </div>
      <div className="grafico__legenda">
        <span><i className="leg leg--lucro" /> Lucro</span>
        <span><i className="leg leg--bruto" /> Ganho bruto</span>
        {meta > 0 && <span><i className="leg leg--meta" /> Meta</span>}
      </div>
    </div>
  );
}
