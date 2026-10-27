import { useState } from 'react';
import Campo from '../components/Campo.jsx';
import SeletorApps from './SeletorApps.jsx';
import { api } from '../api.js';
import { moeda } from '../util.js';
import { perfilParaForm, formParaPerfil, previaCusto } from './campos-perfil.js';

export default function Veiculo({ perfil, onSalvo }) {
  const [form, setForm] = useState(perfilParaForm(perfil));
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const mudar = (nome, valor) => { setMsg(''); setForm((f) => ({ ...f, [nome]: valor })); };
  const custo = previaCusto(form);

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
      <Campo rotulo="Meta de lucro por dia" nome="meta_diaria" valor={form.meta_diaria} onChange={mudar} prefixo="R$" />
      <Campo rotulo="Modelo do carro" nome="modelo_veiculo" valor={form.modelo_veiculo} onChange={mudar} />
      <div className="duas-colunas">
        <Campo rotulo="Consumo" nome="consumo_km_l" valor={form.consumo_km_l} onChange={mudar} sufixo="km/l" />
        <Campo rotulo="Combustível" nome="preco_combustivel" valor={form.preco_combustivel} onChange={mudar} prefixo="R$" sufixo="/l" />
      </div>
      <Campo rotulo="Custos fixos por mês" nome="custos_fixos_mensais" valor={form.custos_fixos_mensais} onChange={mudar} prefixo="R$" dica="Seguro, IPVA, parcela ou aluguel, manutenção." />
      <Campo rotulo="Km rodados por mês" nome="km_mensal_estimado" valor={form.km_mensal_estimado} onChange={mudar} sufixo="km" />

      <div className="resultado">
        <div><span>Combustível</span><strong>{moeda(custo.combustivel)}/km</strong></div>
        <div><span>Custos fixos</span><strong>{moeda(custo.fixo)}/km</strong></div>
        <div className="resultado__lucro"><span>Custo real por km</span><strong>{moeda(custo.total)}</strong></div>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {msg && <p className="sucesso">{msg}</p>}
      <button className="botao">Salvar alterações</button>
    </form>
  );
}
