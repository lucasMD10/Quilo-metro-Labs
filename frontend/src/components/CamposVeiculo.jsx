import { useState } from 'react';
import Campo from './Campo.jsx';
import SeletorPeriodo from './SeletorPeriodo.jsx';
import Segmentado from './Segmentado.jsx';
import KmIcon from './KmIcon.jsx';
import { moeda, numeroBR, lerNumero } from '../util.js';
import { CUSTOS_FIXOS, COMBUSTIVEIS, usaCombustivel } from '../pages/campos-perfil.js';

// Campos do carro agrupados por assunto. Usado no cadastro inicial e na aba Perfil.
// Os custos fixos ficam numa seção que abre e fecha, mostrando o total quando fechada.
// previa: custo do carro calculado pela API (POST /api/perfil/previa) a partir do formulário.
export default function CamposVeiculo({ form, onChange, previa }) {
  const kmMes = previa?.km_mensal || 0;
  const custosMes = previa?.custos_fixos_mensais || 0;
  const [custosAbertos, setCustosAbertos] = useState(false);
  // Campo de custo com valor inválido nunca fica escondido.
  const custoInvalido = CUSTOS_FIXOS.some((c) => Number.isNaN(lerNumero(form[c.nome])));
  const mostrarCustos = custosAbertos || custoInvalido;
  return (
    <>
      <Campo rotulo="Modelo do carro" nome="modelo_veiculo" valor={form.modelo_veiculo} onChange={onChange} placeholder="Ex.: Onix 1.0 2020" />

      <h3 className="grupo"><KmIcon name="combustivel" size={20} /> Combustível</h3>
      <Combustiveis form={form} onChange={onChange} />

      <h3 className="grupo"><KmIcon name="quilometragem" size={20} /> Quanto você roda</h3>
      <Campo rotulo="Km num dia normal de trabalho" nome="km_por_dia" valor={form.km_por_dia} onChange={onChange} sufixo="km/dia" />
      <fieldset className="campo">
        <legend className="campo__rotulo">Dias de trabalho por semana</legend>
        <div className="chips chips--dias">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              type="button"
              key={d}
              className={`chip ${form.dias_por_semana === String(d) ? 'chip--ativo' : ''}`}
              aria-pressed={form.dias_por_semana === String(d)}
              onClick={() => onChange('dias_por_semana', String(d))}
            >
              {d}
            </button>
          ))}
        </div>
        {kmMes > 0 && <span className="campo__dica">Dá uns {numeroBR(kmMes)} km por mês.</span>}
      </fieldset>

      <h3 className="grupo grupo--sanfona">
        <button type="button" className="sanfona" aria-expanded={mostrarCustos} onClick={() => setCustosAbertos((a) => !a)}>
          <KmIcon name="custos-fixos" size={20} />
          <span className="sanfona__titulo">Custos fixos do carro</span>
          <span className="sanfona__resumo">{custosMes > 0 ? `${moeda(custosMes)}/mês` : 'Não informado'}</span>
          <span className="sanfona__seta" aria-hidden="true" />
        </button>
      </h3>
      {previa && custosMes === 0 && !mostrarCustos && (
        <p className="grupo__dica">Sem parcela, seguro, IPVA e manutenção, o lucro estimado fica maior do que o real.</p>
      )}
      {mostrarCustos && (
        <div className="sanfona__conteudo">
          <p className="grupo__dica">Gastos que existem mesmo com o carro parado. Deixe em branco o que não se aplica. Não coloque combustível aqui.</p>
          {CUSTOS_FIXOS.map((c) => (
            <Campo
              key={c.nome} rotulo={c.rotulo} nome={c.nome} valor={form[c.nome]} onChange={onChange} prefixo="R$" sufixo={c.sufixo} dica={c.dica}
              acessorio={c.periodo && <SeletorPeriodo nome={`${c.nome}_periodo`} valor={form[`${c.nome}_periodo`]} onChange={onChange} rotulo={c.rotulo} />}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Quais combustíveis o carro usa e, para cada um, preço e consumo. Com os dois, o motorista diz
// com qual está abastecendo agora (é o que entra na conta).
function Combustiveis({ form, onChange }) {
  const usados = COMBUSTIVEIS.filter(([c]) => usaCombustivel(form, c));
  const dois = usados.length > 1;
  function alternar(c) {
    const lista = usados.map(([u]) => u);
    if (lista.length === 1 && lista[0] === c) return; // o carro usa pelo menos um
    const nova = lista.includes(c) ? lista.filter((u) => u !== c) : [...lista, c];
    onChange('combustiveis', COMBUSTIVEIS.map(([u]) => u).filter((u) => nova.includes(u)).join(','));
  }
  return (
    <>
      <fieldset className="campo">
        <legend className="campo__rotulo">Qual combustível você usa?</legend>
        <div className="chips">
          {COMBUSTIVEIS.map(([c, nome]) => (
            <button type="button" key={c} className={`chip ${usaCombustivel(form, c) ? 'chip--ativo' : ''}`} aria-pressed={usaCombustivel(form, c)} onClick={() => alternar(c)}>
              {nome}
            </button>
          ))}
        </div>
      </fieldset>
      {dois && (
        <div className="campo">
          <span className="campo__rotulo">Com qual está abastecendo agora?</span>
          <Segmentado opcoes={COMBUSTIVEIS} valor={form.combustivel_padrao} onChange={(v) => onChange('combustivel_padrao', v)} rotulo="Com qual está abastecendo agora?" />
          <span className="campo__dica">É o que entra na conta. Dá para trocar depois ao lançar o dia.</span>
        </div>
      )}
      {usados.map(([c, nome], i) => (
        <div key={c}>
          {dois && <p className="combustivel__titulo">{nome}</p>}
          <div className="duas-colunas">
            <Campo rotulo={dois ? `Preço ${c === 'gasolina' ? 'da gasolina' : 'do etanol'}` : 'Preço do litro'} nome={`preco_${c}`} valor={form[`preco_${c}`]} onChange={onChange} prefixo="R$" dica={i === 0 ? 'O que você paga no posto.' : undefined} />
            <Campo rotulo={dois ? `Km/l com ${c}` : 'Km por litro'} nome={`consumo_${c}`} valor={form[`consumo_${c}`]} onChange={onChange} sufixo="km/l" dica={i === 0 ? 'Quantos km o carro faz com 1 litro.' : undefined} />
          </div>
        </div>
      ))}
    </>
  );
}

// A conta do custo por km e do mês, aberta, mais os avisos. Fica ao lado dos campos no computador.
export function ResumoVeiculo({ form, previa }) {
  if (!previa) return null;
  const padrao = previa.combustivel_padrao || 'gasolina';
  const dois = usaCombustivel(form, 'gasolina') && usaCombustivel(form, 'etanol');
  const meta = lerNumero(form.meta_diaria) || 0;
  const kmDia = lerNumero(form.km_por_dia) || 0;

  return (
    <>
      {previa.avisos.map((a) => <p key={a} className="aviso"><KmIcon name="alerta" size={20} /> <span>{a}</span></p>)}

      <div className="resultado">
        <p className="resultado__titulo"><KmIcon name="custo-km" size={20} /> Quanto cada km custa para você</p>
        <div>
          <span>Combustível{dois ? ` (${padrao})` : ''}<small>{moeda(lerNumero(form[`preco_${padrao}`]) || 0)} o litro ÷ {form[`consumo_${padrao}`] || 0} km/l</small></span>
          <strong>{moeda(previa.combustivel_km)}/km</strong>
        </div>
        <div>
          <span>Custos fixos<small>{moeda(previa.custos_fixos_mensais)} por mês ÷ {numeroBR(previa.km_mensal)} km por mês</small></span>
          <strong>{moeda(previa.fixo_km)}/km</strong>
        </div>
        <div className="resultado__total"><span>Seu custo por km</span><strong>{moeda(previa.total_km)}</strong></div>
        {previa.total_km > 0 && (
          <p className="resultado__nota">Ou seja: a cada 100 km rodados, {moeda(previa.custo_100km)} vão para o carro.</p>
        )}
        {previa.comparacao && (
          <p className="resultado__nota">
            Com esses preços, {previa.comparacao.mais_barato} sai {moeda(previa.comparacao.diferenca_km)} mais barato por km.
          </p>
        )}
      </div>

      {previa.km_mensal > 0 && previa.total_km > 0 && (
        <div className="resultado">
          <p className="resultado__titulo"><KmIcon name="calendario" size={20} /> Quanto o carro custa no seu mês</p>
          <div>
            <span>Combustível<small>{numeroBR(previa.km_mensal)} km × {moeda(previa.combustivel_km)}/km</small></span>
            <strong>{moeda(previa.combustivel_mes)}</strong>
          </div>
          <div><span>Custos fixos<small>soma dos campos de custos fixos</small></span><strong>{moeda(previa.custos_fixos_mensais)}</strong></div>
          <div className="resultado__total"><span>Total por mês</span><strong>{moeda(previa.total_mes)}</strong></div>
          <p className="resultado__nota">Esse valor sai do que você fatura antes de sobrar lucro.</p>
          {previa.faturamento_meta != null && (
            <p className="resultado__meta">
              <KmIcon name="meta" size={20} />
              <span>Para lucrar <strong>{moeda(meta)}</strong> num dia de {numeroBR(kmDia)} km, você precisa faturar <strong>{moeda(previa.faturamento_meta)}</strong> nos apps.</span>
            </p>
          )}
        </div>
      )}
    </>
  );
}
