import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO } from '../util.js';
import Odometro from '../components/Odometro.jsx';
import FaixaMeta from '../components/FaixaMeta.jsx';
import GraficoSemana from '../components/GraficoSemana.jsx';

export default function Inicio({ perfil, onLancar }) {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.resumo(hojeISO(), 7).then(setResumo).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="erro">{erro}</p>;
  if (!resumo) return <p className="carregando">Carregando…</p>;

  const { hoje, totais, dias, meta_diaria } = resumo;

  return (
    <>
      <section className="hero">
        <p className="hero__saudacao">Olá, {perfil.nome}. Lucro de hoje</p>
        <Odometro valor={hoje.lucro} />
        <FaixaMeta lucro={hoje.lucro} meta={meta_diaria} />
        {!hoje.lancado && (
          <button className="botao botao--faixa" onClick={() => onLancar(hojeISO())}>Lançar o dia de hoje</button>
        )}
      </section>

      <section className="indicadores">
        <div>
          <span className="indicadores__valor">{moeda(perfil.custo.total_km)}</span>
          <span className="indicadores__rotulo">custo por km</span>
        </div>
        <div>
          <span className="indicadores__valor">{hoje.lancado ? moeda(hoje.ganho_por_km) : '—'}</span>
          <span className="indicadores__rotulo">ganho por km hoje</span>
        </div>
        <div>
          <span className="indicadores__valor">{numeroBR(hoje.km_rodados)}</span>
          <span className="indicadores__rotulo">km hoje</span>
        </div>
      </section>

      <section className="painel">
        <h2>Últimos 7 dias</h2>
        <GraficoSemana dias={dias} meta={meta_diaria} />
        <dl className="totais">
          <div><dt>Ganho bruto</dt><dd>{moeda(totais.bruto)}</dd></div>
          <div><dt>Custos do carro</dt><dd>−{moeda(totais.custo_total)}</dd></div>
          <div className="totais__destaque"><dt>Lucro real</dt><dd className={totais.lucro < 0 ? 'neg' : ''}>{moeda(totais.lucro)}</dd></div>
          <div><dt>Lucro por hora</dt><dd>{moeda(totais.lucro_por_hora)}</dd></div>
          <div><dt>Dias com meta batida</dt><dd>{resumo.dias_meta_batida} de {totais.dias_trabalhados}</dd></div>
        </dl>
      </section>
    </>
  );
}
