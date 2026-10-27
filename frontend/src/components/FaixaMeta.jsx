import { moeda } from '../util.js';

const TRACOS = 20;

// Barra de progresso da meta desenhada como a faixa amarela da estrada.
export default function FaixaMeta({ lucro, meta }) {
  if (!meta) return <p className="faixa__texto">Defina uma meta diária na aba Veículo para acompanhar seu progresso.</p>;
  const pct = Math.max(0, Math.min(lucro / meta, 1));
  const acesos = Math.round(pct * TRACOS);
  const falta = Math.max(meta - lucro, 0);
  return (
    <div className="faixa">
      <div className="faixa__pista" role="progressbar" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={Math.max(lucro, 0)}>
        {Array.from({ length: TRACOS }, (_, i) => (
          <span key={i} className={`faixa__traco ${i < acesos ? 'faixa__traco--aceso' : ''}`} />
        ))}
      </div>
      <p className="faixa__texto">
        {falta === 0 ? `Meta de ${moeda(meta)} batida.` : `Faltam ${moeda(falta)} para a meta de ${moeda(meta)}.`}
      </p>
    </div>
  );
}
