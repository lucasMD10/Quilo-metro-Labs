import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import { api } from '../api.js';
import CamposVeiculo from '../components/CamposVeiculo.jsx';
import { perfilParaForm, formParaPerfil } from './campos-perfil.js';

// Cadastro inicial em duas etapas: 1) você e sua meta, 2) seu carro.
export default function BoasVindas({ onConcluir }) {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(perfilParaForm(null));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (nome, valor) => setForm((f) => ({ ...f, [nome]: valor }));

  async function concluir(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      onConcluir(await api.salvarPerfil(formParaPerfil(form)));
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="boas-vindas">
      <header className="boas-vindas__topo">
        <img src="/favicon.svg" alt="" width="44" height="44" />
        <h1>KM Real</h1>
        <p>Quanto sobra de verdade a cada quilômetro que você roda.</p>
      </header>

      {etapa === 1 ? (
        <form className="painel" onSubmit={(e) => { e.preventDefault(); if (form.nome.trim()) setEtapa(2); else setErro('Informe seu nome.'); }}>
          <h2>Primeiro, sobre você</h2>
          <Campo rotulo="Como podemos te chamar?" nome="nome" valor={form.nome} onChange={mudar} autoFocus />
          <SeletorApps valor={form.apps} onChange={(v) => mudar('apps', v)} />
          <Campo rotulo="Quanto você quer lucrar por dia?" nome="meta_diaria" valor={form.meta_diaria} onChange={mudar} prefixo="R$" dica="Lucro limpo, já descontando os custos do carro." />
          {erro && <p className="erro">{erro}</p>}
          <button className="botao">Continuar</button>
        </form>
      ) : (
        <form className="painel" onSubmit={concluir}>
          <h2>Agora, o seu carro</h2>
          <p className="grupo__dica">Com esses dados o app calcula quanto cada km rodado custa para você. Uma estimativa já serve, dá para ajustar depois.</p>
          <CamposVeiculo form={form} onChange={mudar} />
          {erro && <p className="erro">{erro}</p>}
          <div className="acoes">
            <button type="button" className="botao botao--secundario" onClick={() => setEtapa(1)}>Voltar</button>
            <button className="botao" disabled={salvando}>{salvando ? 'Salvando…' : 'Começar a usar'}</button>
          </div>
        </form>
      )}
    </main>
  );
}
