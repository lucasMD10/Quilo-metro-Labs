import { moeda } from '../util.js';
import KmIcon from './KmIcon.jsx';

// Progresso do lucro do dia até a meta. A barra é uma estrada: a parte percorrida acende.
// hoje: o dia como vem do /api/resumo, com meta_pct, falta_para_meta e meta_batida calculados na API.
export default function FaixaMeta({ hoje, meta }) {
  if (!meta) return <p className="meta__texto">Defina uma meta diária na aba Perfil para acompanhar seu progresso.</p>;
  const pct = hoje.meta_pct;
  const lucro = hoje.lucro;
  return (
    <div className="meta">
      <div className="meta__topo">
        <span><KmIcon name="meta" size={18} /> Meta do dia</span>
        <strong>{Math.round(pct * 100)}%</strong>
      </div>
      <div className="meta__pista" role="progressbar" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={Math.max(lucro, 0)} aria-label="Progresso da meta">
        <div className="meta__percorrido" style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="meta__texto">
        {hoje.meta_batida ? `Meta de ${moeda(meta)} batida. Boa!` : `Faltam ${moeda(hoje.falta_para_meta)} para a meta de ${moeda(meta)}.`}
      </p>
    </div>
  );
}
