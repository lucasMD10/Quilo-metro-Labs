import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { moeda, numeroBR, dataBR } from '../util.js';

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

  return (
    <section className="painel">
      <h2>Histórico</h2>
      {lista.length === 0 ? (
        <p className="vazio">Nenhum dia lançado ainda. Use a aba Lançar para registrar seu primeiro dia.</p>
      ) : (
        <ul className="historico">
          {lista.map((l) => (
            <li key={l.data} className="historico__item">
              <button className="historico__abrir" onClick={() => onEditar(l.data)}>
                <span className="historico__data">{dataBR(l.data)}</span>
                <span className="historico__meta">{numeroBR(l.km_rodados)} km · bruto {moeda(l.bruto)}</span>
                <span className={`historico__lucro ${l.lucro < 0 ? 'neg' : ''}`}>{moeda(l.lucro)}</span>
              </button>
              <button className="historico__excluir" onClick={() => excluir(l.data)} aria-label={`Excluir ${dataBR(l.data)}`}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
