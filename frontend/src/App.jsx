import { useEffect, useState } from 'react';
import { api } from './api.js';
import BoasVindas from './pages/BoasVindas.jsx';
import Inicio from './pages/Inicio.jsx';
import LancarDia from './pages/LancarDia.jsx';
import Historico from './pages/Historico.jsx';
import Veiculo from './pages/Veiculo.jsx';
import NavInferior from './components/NavInferior.jsx';
import KmIcon from './components/KmIcon.jsx';
import marca from './assets/marca.svg';

const TITULOS = { inicio: 'Início', lancar: 'Lançar dia', historico: 'Histórico', veiculo: 'Você e seu veículo' };

export default function App() {
  const [perfil, setPerfil] = useState(undefined); // undefined = carregando, null = sem cadastro
  const [aba, setAba] = useState('inicio');
  const [dataEdicao, setDataEdicao] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.perfil().then(setPerfil).catch(() => setErro('Não foi possível conectar à API. Confira se o backend está rodando (npm run dev).'));
  }, []);

  function abrirLancamento(data) {
    setDataEdicao(data);
    setAba('lancar');
  }

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
            <span className="topo__carro"><KmIcon name="veiculo" size={18} /> {perfil.modelo_veiculo}</span>
          )}
        </header>
        <main className="conteudo" key={aba}>
          {aba === 'inicio' && <Inicio perfil={perfil} onLancar={abrirLancamento} />}
          {aba === 'lancar' && (
            <LancarDia key={dataEdicao || 'novo'} perfil={perfil} dataInicial={dataEdicao} onSalvo={() => setAba('inicio')} />
          )}
          {aba === 'historico' && <Historico onEditar={abrirLancamento} />}
          {aba === 'veiculo' && <Veiculo perfil={perfil} onSalvo={setPerfil} />}
        </main>
      </div>
    </div>
  );
}
