import Campo from './Campo.jsx';
import { moeda, numeroBR } from '../util.js';
import { CUSTOS_FIXOS, previaCusto, avisosVeiculo } from '../pages/campos-perfil.js';

// Campos do carro agrupados por assunto, com a conta do custo por km aberta no final.
// Usado no cadastro inicial e na aba Veículo.
export default function CamposVeiculo({ form, onChange }) {
  const custo = previaCusto(form);
  const avisos = avisosVeiculo(form);

  return (
    <>
      <Campo rotulo="Modelo do carro" nome="modelo_veiculo" valor={form.modelo_veiculo} onChange={onChange} placeholder="Ex.: Onix 1.0 2020" />

      <h3 className="grupo">Combustível</h3>
      <div className="duas-colunas">
        <Campo rotulo="Preço do litro" nome="preco_combustivel" valor={form.preco_combustivel} onChange={onChange} prefixo="R$" dica="O que você paga no posto." />
        <Campo rotulo="Km por litro" nome="consumo_km_l" valor={form.consumo_km_l} onChange={onChange} sufixo="km/l" dica="Quantos km o carro faz com 1 litro." />
      </div>

      <h3 className="grupo">Quanto você roda</h3>
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
        {custo.kmMes > 0 && <span className="campo__dica">Dá uns {numeroBR(custo.kmMes)} km por mês.</span>}
      </fieldset>

      <h3 className="grupo">Custos fixos do carro</h3>
      <p className="grupo__dica">Gastos que existem mesmo com o carro parado. Deixe em branco o que não se aplica. Não coloque combustível aqui.</p>
      {CUSTOS_FIXOS.map((c) => (
        <Campo key={c.nome} rotulo={c.rotulo} nome={c.nome} valor={form[c.nome]} onChange={onChange} prefixo="R$" sufixo={c.sufixo} dica={c.dica} />
      ))}

      <div className="resultado">
        <p className="resultado__titulo">Quanto cada km rodado custa para você</p>
        <div>
          <span>Combustível<small>{moeda(Number(String(form.preco_combustivel).replace(',', '.')) || 0)} o litro ÷ {form.consumo_km_l || 0} km/l</small></span>
          <strong>{moeda(custo.combustivel)}/km</strong>
        </div>
        <div>
          <span>Custos fixos<small>{moeda(custo.custosMes)} por mês ÷ {numeroBR(custo.kmMes)} km por mês</small></span>
          <strong>{moeda(custo.fixo)}/km</strong>
        </div>
        <div className="resultado__lucro"><span>Seu custo por km</span><strong>{moeda(custo.total)}</strong></div>
        {custo.total > 0 && (
          <p className="resultado__nota">Ou seja: a cada 100 km rodados, {moeda(custo.total * 100)} vão para o carro.</p>
        )}
      </div>

      {avisos.map((a) => <p key={a} className="aviso">{a}</p>)}
    </>
  );
}
