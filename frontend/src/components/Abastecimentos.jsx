import { useEffect, useState } from 'react';
import Campo from './Campo.jsx';
import KmIcon from './KmIcon.jsx';
import Segmentado from './Segmentado.jsx';
import { api } from '../api.js';
import { moeda, numeroBR, dataBR, hojeISO, paraNumero } from '../util.js';
import { COMBUSTIVEIS } from '../pages/campos-perfil.js';

const NOME = Object.fromEntries(COMBUSTIVEIS);
const txt = (v) => (v ? String(v).replace('.', ',') : '');
const titulo = (iso) => { const t = dataBR(iso); return t.charAt(0).toUpperCase() + t.slice(1); };

// Registro do que foi pago no posto. É só controle: não mexe no lucro dos dias (o combustível do
// trabalho já sai pelos km) e não calcula consumo. Validação e preço por litro vêm da API.
export default function Abastecimentos({ perfil }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(null); // null = fechado; { id, data, valor, combustivel_tipo, litros }
  const [salvando, setSalvando] = useState(false);

  const carregar = () => api.abastecimentos().then(setLista).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  const novo = () => { setErro(''); setForm({ id: null, data: hojeISO(), valor: '', combustivel_tipo: perfil.combustivel_padrao || 'gasolina', litros: '' }); };
  const editar = (a) => { setErro(''); setForm({ id: a.id, data: a.data, valor: txt(a.valor), combustivel_tipo: a.combustivel_tipo, litros: txt(a.litros) }); };
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  async function salvar(e) {
    e.preventDefault();
    const valor = paraNumero(form.valor);
    const litros = paraNumero(form.litros);
    if (Number.isNaN(valor) || Number.isNaN(litros)) return setErro('Corrija os campos marcados em vermelho.');
    setSalvando(true);
    try {
      await api.salvarAbastecimento(form.id, { data: form.data, valor, combustivel_tipo: form.combustivel_tipo, litros: litros || null });
      setForm(null);
      carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(a) {
    if (!window.confirm(`Excluir o abastecimento de ${moeda(a.valor)} de ${dataBR(a.data)}?`)) return;
    try {
      await api.excluirAbastecimento(a.id);
      if (form?.id === a.id) setForm(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (!lista) return erro ? <p className="erro">{erro}</p> : <p className="carregando">Carregando…</p>;

  return (
    <div className="abastecimentos">
      {form ? (
        <form className="cartao abastecimento-form" onSubmit={salvar}>
          <h2 className="cartao__titulo"><KmIcon name="combustivel" size={20} /> {form.id ? 'Corrigir abastecimento' : 'Registrar abastecimento'}</h2>
          <p className="grupo__dica">Só para controle do que você pagou no posto. O combustível é pelo que você rodou, não pelo que abasteceu: por isso o abastecimento não muda o lucro dos dias.</p>
          <Campo rotulo="Data" nome="data" tipo="date" valor={form.data} max={hojeISO()} onChange={(_, v) => mudar('data', v || hojeISO())} />
          <div className="campo">
            <span className="campo__rotulo">Combustível</span>
            <Segmentado opcoes={COMBUSTIVEIS} valor={form.combustivel_tipo} onChange={(v) => mudar('combustivel_tipo', v)} rotulo="Combustível do abastecimento" />
          </div>
          <div className="duas-colunas">
            <Campo rotulo="Valor pago" nome="valor" valor={form.valor} onChange={mudar} prefixo="R$" />
            <Campo rotulo="Litros" nome="litros" valor={form.litros} onChange={mudar} sufixo="l" dica="Opcional." />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <div className="abastecimento-form__acoes">
            <button type="button" className="botao botao--secundario" onClick={() => { setForm(null); setErro(''); }}>Cancelar</button>
            <button className="botao" disabled={salvando}><KmIcon name="confirmar" size={20} /> {salvando ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </form>
      ) : (
        <button type="button" className="botao botao--secundario abastecimentos__novo" onClick={novo}>
          <KmIcon name="lancar" size={20} /> Registrar abastecimento
        </button>
      )}
      {!form && <p className="grupo__dica">O combustível é pelo que você rodou, não pelo que abasteceu. Aqui fica só o que você pagou no posto, para comparar no fechamento do mês.</p>}

      {!form && erro && <p className="erro">{erro}</p>}

      {lista.length === 0 ? (
        <section className="cartao vazio">
          <KmIcon name="combustivel" size={40} />
          <p>Nenhum abastecimento registrado. Registre o que pagar no posto para acompanhar seus gastos.</p>
        </section>
      ) : (
        <ul className="historico">
          {lista.map((a) => (
            <li key={a.id} className="historico__item">
              <button className="historico__abrir" onClick={() => editar(a)} aria-label={`Corrigir abastecimento de ${dataBR(a.data)}`}>
                <span className="historico__data">{titulo(a.data)}</span>
                <span className="historico__meta">
                  <span><KmIcon name="combustivel" size={16} /> {NOME[a.combustivel_tipo] || a.combustivel_tipo}</span>
                  {a.litros && <span>{numeroBR(a.litros, a.litros % 1 ? 2 : 0)} l · {moeda(a.preco_litro)}/l</span>}
                </span>
                <span className="historico__lucro abastecimento__valor">{moeda(a.valor)}</span>
              </button>
              <button className="icone-botao icone-botao--perigo" onClick={() => excluir(a)} aria-label={`Excluir abastecimento de ${dataBR(a.data)}`}><KmIcon name="excluir" size={20} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
