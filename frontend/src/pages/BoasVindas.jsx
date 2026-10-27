import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import { api } from '../api.js';
import { moeda } from '../util.js';
import { perfilParaForm, formParaPerfil, previaCusto } from './campos-perfil.js';

// Cadastro inicial em duas etapas: 1) você e sua meta, 2) seu carro.
export default function BoasVindas({ onConcluir }) {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(perfilParaForm(null));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (nome, valor) => setForm((f) => ({ ...f, [nome]: valor }));
  const custo = previaCusto(form);

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
          <Campo rotulo="Modelo" nome="modelo_veiculo" valor={form.modelo_veiculo} onChange={mudar} placeholder="Ex.: Onix 1.0 2020" />
          <div className="duas-colunas">
            <Campo rotulo="Consumo" nome="consumo_km_l" valor={form.consumo_km_l} onChange={mudar} sufixo="km/l" />
            <Campo rotulo="Combustível" nome="preco_combustivel" valor={form.preco_combustivel} onChange={mudar} prefixo="R$" sufixo="/l" />
          </div>
          <Campo rotulo="Custos fixos por mês" nome="custos_fixos_mensais" valor={form.custos_fixos_mensais} onChange={mudar} prefixo="R$" dica="Some seguro, IPVA, parcela ou aluguel do carro e manutenção." />
          <Campo rotulo="Quantos km você roda por mês?" nome="km_mensal_estimado" valor={form.km_mensal_estimado} onChange={mudar} sufixo="km" dica="Uma estimativa já serve. Dá para ajustar depois." />
          <p className="previa">Seu custo real: <strong>{moeda(custo.total)} por km</strong></p>
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
