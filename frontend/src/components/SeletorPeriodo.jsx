import Segmentado from './Segmentado.jsx';

// Escolha entre informar um valor por mês ou por ano. Fica dentro do campo, no lugar do "/mês".
// Só escolhe a unidade: quem converte o valor para o mês é a API.
const OPCOES = [['mes', 'Mês'], ['ano', 'Ano']];

export default function SeletorPeriodo({ nome, valor, onChange, rotulo }) {
  return (
    <Segmentado
      className="segmentado--no-campo"
      opcoes={OPCOES}
      valor={valor}
      onChange={(v) => onChange(nome, v)}
      rotulo={`${rotulo}: valor por mês ou por ano`}
    />
  );
}
