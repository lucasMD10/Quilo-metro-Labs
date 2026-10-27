const ABAS = [
  { id: 'inicio', rotulo: 'Início', icone: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'lancar', rotulo: 'Lançar', icone: 'M12 5v14M5 12h14' },
  { id: 'historico', rotulo: 'Histórico', icone: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'veiculo', rotulo: 'Veículo', icone: 'M5 16l1.5-5h11L19 16M4 16h16v3H4zM7.5 19v1.5M16.5 19v1.5' },
];

export default function NavInferior({ aba, onTrocar }) {
  return (
    <nav className="nav">
      {ABAS.map((a) => (
        <button
          key={a.id}
          className={`nav__item ${aba === a.id ? 'nav__item--ativo' : ''}`}
          onClick={() => onTrocar(a.id)}
          aria-current={aba === a.id ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={a.icone} />
          </svg>
          {a.rotulo}
        </button>
      ))}
    </nav>
  );
}
