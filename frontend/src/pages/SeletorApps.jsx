const OPCOES = [
  { id: 'uber', rotulo: 'Uber' },
  { id: '99', rotulo: '99' },
];

// Botões liga/desliga para escolher em quais apps o motorista trabalha.
export default function SeletorApps({ valor, onChange }) {
  const marcados = valor ? valor.split(',').filter(Boolean) : [];
  function alternar(id) {
    const novo = marcados.includes(id) ? marcados.filter((m) => m !== id) : [...marcados, id];
    onChange(novo.join(','));
  }
  return (
    <fieldset className="campo">
      <legend className="campo__rotulo">Em quais apps você roda?</legend>
      <div className="chips">
        {OPCOES.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`chip ${marcados.includes(o.id) ? 'chip--ativo' : ''}`}
            aria-pressed={marcados.includes(o.id)}
            onClick={() => alternar(o.id)}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
