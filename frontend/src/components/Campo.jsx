// Campo de formulário reutilizável. "prefixo"/"sufixo" mostram unidades como R$ ou km.
export default function Campo({ rotulo, nome, valor, onChange, prefixo, sufixo, tipo = 'text', dica, ...resto }) {
  return (
    <label className="campo">
      <span className="campo__rotulo">{rotulo}</span>
      <span className="campo__caixa">
        {prefixo && <span className="campo__afixo">{prefixo}</span>}
        <input
          name={nome}
          type={tipo}
          inputMode={tipo === 'text' && (prefixo || sufixo) ? 'decimal' : undefined}
          value={valor ?? ''}
          onChange={(e) => onChange(nome, e.target.value)}
          {...resto}
        />
        {sufixo && <span className="campo__afixo">{sufixo}</span>}
      </span>
      {dica && <span className="campo__dica">{dica}</span>}
    </label>
  );
}
