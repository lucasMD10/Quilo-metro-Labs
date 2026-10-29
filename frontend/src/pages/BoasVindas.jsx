import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import { api, MODO_NAVEGADOR } from '../api.js';
import CamposVeiculo, { ResumoVeiculo } from '../components/CamposVeiculo.jsx';
import KmIcon from '../components/KmIcon.jsx';
import marcaNome from '../assets/marca-nome.svg';
import marca from '../assets/marca.svg';
import { perfilParaForm, formParaPerfil, temNumeroInvalido } from './campos-perfil.js';

// Cadastro inicial em duas etapas: 1) você e sua meta, 2) seu carro.
export default function BoasVindas({ onConcluir }) {
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(perfilParaForm(null));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  async function concluir(e) {
    e.preventDefault();
    setErro('');
    if (temNumeroInvalido(form)) return setErro('Corrija os campos marcados em vermelho.');
    setSalvando(true);
    try {
      onConcluir(await api.salvarPerfil(formParaPerfil(form)));
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  // Só na versão do navegador (GitHub Pages): abre direto com o motorista de exemplo, para demonstrar.
  async function verExemplo() {
    setSalvando(true);
    try {
      onConcluir(await api.carregarExemplo());
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  function continuar(e) {
    e.preventDefault();
    if (!form.nome.trim()) setErro('Informe seu nome.');
    else if (temNumeroInvalido(form)) setErro('Corrija os campos marcados em vermelho.');
    else { setErro(''); setEtapa(2); window.scrollTo(0, 0); }
  }

  return (
    <main className={`boas-vindas boas-vindas--etapa${etapa}`}>
      <section className="boas-vindas__marca">
        <img className="boas-vindas__logo" src={marcaNome} alt="KM Real" />
        <div className="boas-vindas__topo-cel">
          <img src={marca} alt="" width="34" height="41" />
          <span>KM Real</span>
        </div>
        <p className="boas-vindas__frase">Quanto sobra de verdade a cada quilômetro que você roda.</p>
        <ul className="boas-vindas__lista">
          <li><KmIcon name="custo-km" size={22} /> Descubra o custo real de cada km do seu carro</li>
          <li><KmIcon name="lucro-real" size={22} /> Veja quanto sobra no bolso a cada dia</li>
          <li><KmIcon name="meta" size={22} /> Acompanhe sua meta diária e a semana</li>
        </ul>
      </section>

      <section className="boas-vindas__form">
        <p className="passos">Passo {etapa} de 2</p>
        <div className="passos__barra"><span style={{ width: etapa === 1 ? '50%' : '100%' }} /></div>

        {etapa === 1 ? (
          <form className="cartao" onSubmit={continuar}>
            <h2 className="cartao__titulo">Primeiro, sobre você</h2>
            <Campo rotulo="Como podemos te chamar?" nome="nome" valor={form.nome} onChange={mudar} autoFocus />
            <SeletorApps valor={form.apps} onChange={(v) => mudar('apps', v)} />
            <Campo rotulo="Quanto você quer lucrar por dia?" nome="meta_diaria" valor={form.meta_diaria} onChange={mudar} prefixo="R$" dica="O que sobra no bolso, depois dos custos do carro." />
            {erro && <p className="erro">{erro}</p>}
            <button className="botao">Continuar</button>
            {MODO_NAVEGADOR && (
              <button type="button" className="link-botao" onClick={verExemplo} disabled={salvando}>
                <KmIcon name="detalhar" size={18} /> Ver com dados de exemplo
              </button>
            )}
          </form>
        ) : (
          <form className="cartao" onSubmit={concluir}>
            <h2 className="cartao__titulo">Agora, o seu carro</h2>
            <p className="grupo__dica">Com esses dados o app calcula quanto cada km rodado custa para você. Uma estimativa já serve, dá para ajustar depois.</p>
            <CamposVeiculo form={form} onChange={mudar} />
            <ResumoVeiculo form={form} />
            {erro && <p className="erro">{erro}</p>}
            <div className="acoes">
              <button type="button" className="botao botao--secundario" onClick={() => setEtapa(1)}>Voltar</button>
              <button className="botao" disabled={salvando}>{salvando ? 'Salvando…' : 'Começar a usar'}</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
