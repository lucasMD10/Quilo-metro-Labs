import { useEffect, useState } from 'react';
import { api, MODO_NAVEGADOR } from './api.js';
import BoasVindas from './pages/BoasVindas.jsx';
import Inicio from './pages/Inicio.jsx';
import LancarDia from './pages/LancarDia.jsx';
import Historico from './pages/Historico.jsx';
import Veiculo from './pages/Veiculo.jsx';
import NavInferior from './components/NavInferior.jsx';
import KmIcon from './components/KmIcon.jsx';
import marca from './assets/marca.svg';

const TITULOS = { inicio: 'Início', lancar: 'Lançar dia', historico: 'Histórico', perfil: 'Perfil e veículo' };

export default function App() {
  const [perfil, setPerfil] = useState(undefined); // undefined = carregando, null = sem cadastro
  const [aba, setAba] = useState('inicio');
  const [dataEdicao, setDataEdicao] = useState(null);
  const [erro, setErro] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.perfil().then(setPerfil).catch((e) => setErro(MODO_NAVEGADOR ? e.message : 'Não foi possível conectar à API. Confira se o backend está rodando (npm run dev).'));
  }, []);

  function abrirLancamento(data) {
    setDataEdicao(data);
    setAba('lancar');
  }

  // Aviso rápido no rodapé ("Dia salvo"), some sozinho.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function trocarAba(id) {
    if (id === 'lancar') setDataEdicao(null);
    setAba(id);
  }

  if (erro) return <main className="estado"><p className="erro">{erro}</p></main>;
  if (perfil === undefined) return <main className="estado"><p className="carregando">Carregando…</p></main>;
  if (perfil === null) return <BoasVindas onConcluir={setPerfil} />;

  return (
    <div className="app">
      <NavInferior aba={aba} onTrocar={trocarAba} />
      <div className="app__principal">
        <header className="topo">
          <img className="topo__logo" src={marca} alt="" width="26" height="31" />
          <h1 className="topo__titulo">{aba === 'inicio' ? 'KM Real' : TITULOS[aba]}</h1>
          {perfil.modelo_veiculo && (
            <button className="topo__carro" onClick={() => trocarAba('perfil')} aria-label={`${perfil.modelo_veiculo}: abrir perfil e veículo`}>
              <KmIcon name="veiculo" size={18} /> {perfil.modelo_veiculo}
            </button>
          )}
        </header>
        <main className="conteudo" key={aba}>
          {aba === 'inicio' && <Inicio perfil={perfil} onLancar={abrirLancamento} onPerfil={() => trocarAba('perfil')} />}
          {aba === 'lancar' && (
            <LancarDia key={dataEdicao || 'novo'} perfil={perfil} dataInicial={dataEdicao} onSalvo={(msg) => { setToast(msg); setAba('inicio'); }} />
          )}
          {aba === 'historico' && <Historico onEditar={abrirLancamento} />}
          {aba === 'perfil' && <Veiculo perfil={perfil} onSalvo={(p) => { setPerfil(p); setToast('Perfil salvo. Os próximos dias já usam o novo custo por km.'); }} />}
        </main>
      </div>
      {toast && <div className={`toast ${aba === 'lancar' || aba === 'perfil' ? 'toast--acima' : ''}`} role="status"><KmIcon name="confirmar" size={20} /> {toast}</div>}
    </div>
  );
}
