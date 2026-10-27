import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import { api } from '../api.js';
import CamposVeiculo from '../components/CamposVeiculo.jsx';
import { perfilParaForm, formParaPerfil } from './campos-perfil.js';

export default function Veiculo({ perfil, onSalvo }) {
  const [form, setForm] = useState(perfilParaForm(perfil));
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const mudar = (nome, valor) => { setMsg(''); setForm((f) => ({ ...f, [nome]: valor })); };

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      onSalvo(await api.salvarPerfil(formParaPerfil(form)));
      setMsg('Alterações salvas. Os próximos lançamentos já usam o novo custo por km.');
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <form className="painel" onSubmit={salvar}>
      <h2>Você e seu veículo</h2>
      <Campo rotulo="Nome" nome="nome" valor={form.nome} onChange={mudar} />
      <SeletorApps valor={form.apps} onChange={(v) => mudar('apps', v)} />
      <Campo rotulo="Meta de lucro por dia" nome="meta_diaria" valor={form.meta_diaria} onChange={mudar} prefixo="R$" dica="Lucro limpo, depois de descontar os custos do carro." />
      <CamposVeiculo form={form} onChange={mudar} />

      {erro && <p className="erro">{erro}</p>}
      {msg && <p className="sucesso">{msg}</p>}
      <button className="botao">Salvar alterações</button>
    </form>
  );
}
