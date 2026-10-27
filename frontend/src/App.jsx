import { useEffect, useState } from 'react';
import { api } from './api.js';
import BoasVindas from './pages/BoasVindas.jsx';
import Inicio from './pages/Inicio.jsx';
import LancarDia from './pages/LancarDia.jsx';
import Historico from './pages/Historico.jsx';
import Veiculo from './pages/Veiculo.jsx';
import NavInferior from './components/NavInferior.jsx';

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

  if (erro) return <main className="app"><p className="erro">{erro}</p></main>;
  if (perfil === undefined) return <main className="app"><p className="carregando">Carregando…</p></main>;
  if (perfil === null) return <BoasVindas onConcluir={setPerfil} />;

  return (
    <div className="app">
      <header className="topo">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span className="topo__marca">KM Real</span>
        {perfil.modelo_veiculo && <span className="topo__carro">{perfil.modelo_veiculo}</span>}
      </header>
      <main className="conteudo">
        {aba === 'inicio' && <Inicio perfil={perfil} onLancar={abrirLancamento} />}
        {aba === 'lancar' && (
          <LancarDia key={dataEdicao || 'novo'} perfil={perfil} dataInicial={dataEdicao} onSalvo={() => setAba('inicio')} />
        )}
        {aba === 'historico' && <Historico onEditar={abrirLancamento} />}
        {aba === 'veiculo' && <Veiculo perfil={perfil} onSalvo={setPerfil} />}
      </main>
      <NavInferior aba={aba} onTrocar={trocarAba} />
    </div>
  );
}
