import { lerNumero } from '../util.js';

// Campo de formulário reutilizável. "prefixo"/"sufixo" mostram unidades como R$ ou km.
// Campos com unidade são numéricos: aceitam só dígitos, vírgula e ponto, e avisam se o valor não for um número.
export default function Campo({ rotulo, nome, valor, onChange, prefixo, sufixo, tipo = 'text', dica, ...resto }) {
  const numerico = tipo === 'text' && Boolean(prefixo || sufixo);
  const invalido = numerico && Number.isNaN(lerNumero(valor));
  return (
    <label className={`campo ${invalido ? 'campo--invalido' : ''}`}>
      <span className="campo__rotulo">{rotulo}</span>
      <span className="campo__caixa">
        {prefixo && <span className="campo__afixo">{prefixo}</span>}
        <input
          name={nome}
          type={tipo}
          inputMode={numerico ? 'decimal' : undefined}
          aria-invalid={invalido || undefined}
          value={valor ?? ''}
          onChange={(e) => onChange(nome, numerico ? e.target.value.replace(/[^\d.,]/g, '') : e.target.value)}
          {...resto}
        />
        {sufixo && <span className="campo__afixo">{sufixo}</span>}
      </span>
      {invalido && <span className="campo__erro">Número inválido. Exemplos: 6 · 6,29 · 1.000</span>}
      {dica && <span className="campo__dica">{dica}</span>}
    </label>
  );
}
