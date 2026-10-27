import KmIcon from './KmIcon.jsx';
import marca from '../assets/marca.svg';

const ABAS = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'lancar', rotulo: 'Lançar' },
  { id: 'historico', rotulo: 'Histórico' },
  { id: 'veiculo', rotulo: 'Veículo' },
];

// No celular é a barra de baixo; no computador vira o menu lateral (ver styles.css).
export default function NavInferior({ aba, onTrocar }) {
  return (
    <nav className="nav" aria-label="Navegação principal">
      <div className="nav__marca">
        <img src={marca} alt="" width="28" height="33" />
        <span>KM Real</span>
      </div>
      {ABAS.map((a) => (
        <button
          key={a.id}
          className={`nav__item ${aba === a.id ? 'nav__item--ativo' : ''}`}
          onClick={() => onTrocar(a.id)}
          aria-current={aba === a.id ? 'page' : undefined}
        >
          <KmIcon name={a.id} />
          {a.rotulo}
        </button>
      ))}
    </nav>
  );
}
