// Escolha de uma opção entre poucas (ex.: Mês | Ano, Gasolina | Etanol), em botões lado a lado.
// Só escolhe: o que cada opção significa nas contas é decidido pela API.
export default function Segmentado({ opcoes, valor, onChange, rotulo, className = '' }) {
  return (
    <span className={`segmentado ${className}`} role="radiogroup" aria-label={rotulo}>
      {opcoes.map(([id, texto]) => (
        <button
          type="button"
          key={id}
          role="radio"
          aria-checked={valor === id}
          className={`segmentado__opcao ${valor === id ? 'segmentado__opcao--ativa' : ''}`}
          onClick={() => onChange(id)}
        >
          {texto}
        </button>
      ))}
    </span>
  );
}
