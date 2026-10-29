import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO } from '../util.js';
import ValorAnimado from '../components/ValorAnimado.jsx';
import FaixaMeta from '../components/FaixaMeta.jsx';
import GraficoSemana from '../components/GraficoSemana.jsx';
import KmIcon from '../components/KmIcon.jsx';
import FechamentoMes from '../components/FechamentoMes.jsx';

export default function Inicio({ perfil, onLancar, onPerfil }) {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');
  const [verCalculo, setVerCalculo] = useState(false);

  useEffect(() => {
    api.resumo(hojeISO(), 7).then(setResumo).catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="erro">{erro}</p>;
  if (!resumo) return <p className="carregando">Carregando…</p>;

  const { hoje, totais, dias, meta_diaria } = resumo;
  const { custo } = perfil;

  return (
    <div className="inicio">
      <section className="hero">
        <p className="hero__saudacao">Olá, {perfil.nome}</p>
        <p className="hero__rotulo">Lucro estimado de hoje</p>
        <ValorAnimado valor={hoje.lucro} className="hero__valor" />
        <FaixaMeta hoje={hoje} meta={meta_diaria} />
        <button className="botao botao--claro" onClick={() => onLancar(hojeISO())}>
          <KmIcon name={hoje.lancado ? 'editar' : 'lancar'} size={20} />
          {hoje.lancado ? 'Editar o dia de hoje' : 'Lançar o dia de hoje'}
        </button>
      </section>

      <section className="indicadores" aria-label="Indicadores de hoje">
        <button className={`indicador ${verCalculo ? 'indicador--ativo' : ''}`} onClick={() => setVerCalculo((v) => !v)} aria-expanded={verCalculo}>
          <span className="indicador__icone"><KmIcon name="custo-km" size={20} /></span>
          <span className="indicador__valor">{moeda(custo.total_km)}</span>
          <span className="indicador__rotulo">seu custo por km</span>
          <span className="indicador__acao"><KmIcon name="detalhar" size={16} /> {verCalculo ? 'Fechar' : 'Entender o cálculo'}</span>
        </button>
        <button className="indicador" onClick={() => onLancar(hojeISO())}>
          <span className="indicador__icone"><KmIcon name="ganhos" size={20} /></span>
          <span className="indicador__valor">{hoje.lancado ? moeda(hoje.ganho_por_km) : '—'}</span>
          <span className="indicador__rotulo">ganho bruto por km hoje</span>
        </button>
        <button className="indicador" onClick={() => onLancar(hojeISO())}>
          <span className="indicador__icone"><KmIcon name="quilometragem" size={20} /></span>
          <span className="indicador__valor">{numeroBR(hoje.km_rodados)} km</span>
          <span className="indicador__rotulo">rodados hoje</span>
        </button>
      </section>

      {verCalculo && (
        <section className="cartao calculo" aria-label="Como o custo por km é calculado">
          <h2 className="cartao__titulo"><KmIcon name="detalhar" size={20} /> Como chegamos em {moeda(custo.total_km)} por km</h2>
          <dl className="linhas">
            <div><dt><KmIcon name="combustivel" size={18} /> Combustível<small>{moeda(perfil.preco_combustivel)} o litro ÷ {numeroBR(perfil.consumo_km_l, 1)} km/l</small></dt><dd>{moeda(custo.combustivel_km)}/km</dd></div>
            <div><dt><KmIcon name="custos-fixos" size={18} /> Custos fixos<small>{moeda(perfil.custos_fixos_mensais)} por mês ÷ {numeroBR(perfil.km_mensal_estimado)} km por mês</small></dt><dd>{moeda(custo.fixo_km)}/km</dd></div>
            <div className="linhas__total"><dt>Custo por km</dt><dd>{moeda(custo.total_km)}</dd></div>
          </dl>
          <p className="nota">Cada km rodado no dia é descontado por esse valor. É uma estimativa: os custos fixos do mês são divididos pelos km que você prevê rodar. Se rodar menos, o custo real de cada km fica maior.</p>
          <button className="link-botao" onClick={onPerfil}><KmIcon name="editar" size={18} /> Ajustar os dados do carro</button>
        </section>
      )}

      <section className="cartao semana">
        <h2 className="cartao__titulo"><KmIcon name="calendario" size={20} /> Últimos 7 dias</h2>
        <GraficoSemana dias={dias} meta={meta_diaria} onAbrirDia={onLancar} />
        <dl className="linhas">
          <div><dt>Ganho bruto</dt><dd>{moeda(totais.bruto)}</dd></div>
          <div><dt>Custos do carro e gastos</dt><dd className="custo">−{moeda(totais.custo_total)}</dd></div>
          <div className="linhas__total"><dt>Lucro estimado</dt><dd className={totais.lucro < 0 ? 'neg' : 'pos'}>{moeda(totais.lucro)}</dd></div>
          <div><dt><KmIcon name="horas" size={18} /> Lucro por hora</dt><dd>{moeda(totais.lucro_por_hora)}</dd></div>
          <div><dt><KmIcon name="meta" size={18} /> Dias com meta batida</dt><dd>{resumo.dias_meta_batida} de {totais.dias_trabalhados}</dd></div>
        </dl>
      </section>

      <FechamentoMes />
    </div>
  );
}
