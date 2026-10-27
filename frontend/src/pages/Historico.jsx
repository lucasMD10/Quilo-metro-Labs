import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { moeda, numeroBR, dataBR } from '../util.js';
import KmIcon from '../components/KmIcon.jsx';

// "segunda-feira, 26 de outubro" -> "Segunda-feira, 26 de outubro"
const titulo = (iso) => { const t = dataBR(iso); return t.charAt(0).toUpperCase() + t.slice(1); };

export default function Historico({ onEditar }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  const carregar = () => api.lancamentos().then(setLista).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);

  async function excluir(data) {
    if (!window.confirm(`Excluir o lançamento de ${dataBR(data)}?`)) return;
    try {
      await api.excluirLancamento(data);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro) return <p className="erro">{erro}</p>;
  if (!lista) return <p className="carregando">Carregando…</p>;

  if (lista.length === 0) {
    return (
      <section className="cartao vazio">
        <KmIcon name="historico" size={40} />
        <p>Nenhum dia lançado ainda. Use a aba Lançar para registrar seu primeiro dia.</p>
      </section>
    );
  }

  return (
    <ul className="historico">
      {lista.map((l) => (
        <li key={l.data} className="historico__item">
          <button className="historico__abrir" onClick={() => onEditar(l.data)} aria-label={`Abrir ${dataBR(l.data)}`}>
            <span className="historico__data">{titulo(l.data)}</span>
            <span className="historico__meta">
              <span><KmIcon name="quilometragem" size={16} /> {numeroBR(l.km_rodados)} km</span>
              <span><KmIcon name="ganhos" size={16} /> bruto {moeda(l.bruto)}</span>
            </span>
            <span className={`historico__lucro ${l.lucro < 0 ? 'neg' : 'pos'}`}>{moeda(l.lucro)}</span>
          </button>
          {/* Tocar no dia já abre a edição; o único botão extra é o de excluir. */}
          <button className="icone-botao icone-botao--perigo" onClick={() => excluir(l.data)} aria-label={`Excluir ${dataBR(l.data)}`}><KmIcon name="excluir" size={20} /></button>
        </li>
      ))}
    </ul>
  );
}
