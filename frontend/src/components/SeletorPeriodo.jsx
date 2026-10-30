// Escolha entre informar um valor por mês ou por ano. Fica dentro do campo, no lugar do "/mês".
// Só escolhe a unidade: quem converte o valor para o mês é a API.
const OPCOES = [['mes', 'Mês'], ['ano', 'Ano']];

export default function SeletorPeriodo({ nome, valor, onChange, rotulo }) {
  return (
    <span className="periodo" role="radiogroup" aria-label={`${rotulo}: valor por mês ou por ano`}>
      {OPCOES.map(([id, texto]) => (
        <button
          type="button"
          key={id}
          role="radio"
          aria-checked={valor === id}
          className={`periodo__opcao ${valor === id ? 'periodo__opcao--ativa' : ''}`}
          onClick={() => onChange(nome, id)}
        >
          {texto}
        </button>
      ))}
    </span>
  );
}
