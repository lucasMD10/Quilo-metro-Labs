import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import CamposVeiculo, { ResumoVeiculo } from '../components/CamposVeiculo.jsx';
import KmIcon from '../components/KmIcon.jsx';
import { api } from '../api.js';
import { moeda } from '../util.js';
import { perfilParaForm, formParaPerfil, temNumeroInvalido, previaCusto } from './campos-perfil.js';

export default function Veiculo({ perfil, onSalvo }) {
  const [form, setForm] = useState(perfilParaForm(perfil));
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (temNumeroInvalido(form)) return setErro('Corrija os campos marcados em vermelho.');
    setSalvando(true);
    try {
      onSalvo(await api.salvarPerfil(formParaPerfil(form)));
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="pagina-form" onSubmit={salvar}>
      <div className="cartao pagina-form__campos">
        <h3 className="grupo grupo--primeiro">Sobre você</h3>
        <Campo rotulo="Nome" nome="nome" valor={form.nome} onChange={mudar} />
        <SeletorApps valor={form.apps} onChange={(v) => mudar('apps', v)} />
        <Campo rotulo="Meta de lucro por dia" nome="meta_diaria" valor={form.meta_diaria} onChange={mudar} prefixo="R$" dica="Lucro limpo, depois de descontar os custos do carro." />
        <h3 className="grupo"><KmIcon name="veiculo" size={20} /> Seu carro</h3>
        <CamposVeiculo form={form} onChange={mudar} />
      </div>

      <aside className="pagina-form__resumo">
        <ResumoVeiculo form={form} />
        {erro && <p className="erro">{erro}</p>}
        <div className="barra-acao">
          <div className="barra-acao__resumo">
            <span>Custo por km</span>
            <strong>{moeda(previaCusto(form).total)}</strong>
          </div>
          <button className="botao" disabled={salvando}>
            <KmIcon name="confirmar" size={20} /> {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </aside>
    </form>
  );
}
