import { useEffect, useState } from 'react';
import Campo from '../components/Campo.jsx';
import KmIcon from '../components/KmIcon.jsx';
import CombustivelDoDia from '../components/CombustivelDoDia.jsx';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO, paraNumero, lerHoras, horasTexto } from '../util.js';
import { usePrevia } from '../usePrevia.js';

const NUMERICOS = ['ganho_uber', 'ganho_99', 'ganho_outros', 'km_rodados', 'horas_trabalhadas', 'gastos_extras'];

const VAZIO = { ganho_uber: '', ganho_99: '', ganho_outros: '', km_rodados: '', horas_trabalhadas: '', gastos_extras: '', observacao: '' };
const txt = (v) => (v ? String(v).replace('.', ',') : '');
const ler = (k, v) => (k === 'horas_trabalhadas' ? lerHoras(v) : paraNumero(v));
const DICA_TAXA = 'O que caiu pra você, já sem a taxa do app.';

export default function LancarDia({ perfil, dataInicial, onSalvo }) {
  const [data, setData] = useState(dataInicial || hojeISO());
  const [form, setForm] = useState(VAZIO);
  const [salvo, setSalvo] = useState(null); // lançamento já gravado nesse dia (ou null se é um dia novo)
  const [carga, setCarga] = useState('carregando'); // carregando | ok | erro
  const [tentativa, setTentativa] = useState(0);
  const [recalcular, setRecalcular] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  // Ajuste do combustível do dia (null = sem ajuste) e se ele vira o padrão dos próximos dias.
  const [ajuste, setAjuste] = useState(null);
  const [usarProximos, setUsarProximos] = useState(true);
  const apps = perfil.apps.split(',');
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  // Ao trocar a data, carrega o lançamento daquele dia (se já existir) para editar.
  // Só um 404 significa "dia sem lançamento"; qualquer outra falha não pode virar formulário vazio.
  useEffect(() => {
    let atual = true; // vira false se a data mudar antes da resposta chegar
    setErro('');
    setCarga('carregando');
    setRecalcular(false);
    setAjuste(null);
    // Hoje: o que ele ajustar provavelmente vale para amanhã também. Dia antigo: corrigir não muda o padrão.
    setUsarProximos(data === hojeISO());
    api.lancamento(data)
      .then((l) => {
        if (!atual) return;
        setSalvo(l);
        setForm({
          ganho_uber: txt(l.ganho_uber), ganho_99: txt(l.ganho_99), ganho_outros: txt(l.ganho_outros),
          km_rodados: txt(l.km_rodados), horas_trabalhadas: horasTexto(l.horas_trabalhadas),
          gastos_extras: txt(l.gastos_extras), observacao: l.observacao || '',
        });
        setCarga('ok');
      })
      .catch((e) => {
        if (!atual) return;
        if (e.status === 404) { setSalvo(null); setForm(VAZIO); setCarga('ok'); }
        else setCarga('erro');
      });
    return () => { atual = false; };
  }, [data, tentativa]);

  // A conta do dia vem da API (custo por km congelado do dia, recalcular, separação combustível/fixos).
  // Campo ainda inválido entra como zero na prévia; ao salvar ele é barrado.
  const valores = Object.fromEntries(NUMERICOS.map((k) => [k, ler(k, form[k]) || 0]));
  const combustivel = ajuste
    ? { combustivel_tipo: ajuste.tipo, combustivel_preco: paraNumero(ajuste.preco), combustivel_consumo: paraNumero(ajuste.consumo) }
    : {};
  const previa = usePrevia(api.previaLancamento, { data, ...valores, ...combustivel, recalcular_custo: recalcular }, carga === 'ok');
  const custo = previa?.custo || perfil.custo;
  const semSeparacao = !!previa?.sem_separacao;

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (NUMERICOS.some((k) => Number.isNaN(ler(k, form[k])))
      || (ajuste && [combustivel.combustivel_preco, combustivel.combustivel_consumo].some(Number.isNaN))) {
      return setErro('Corrija os campos marcados em vermelho.');
    }
    const dados = {
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, k === 'observacao' ? v : ler(k, v)])),
      ...combustivel,
      ...(ajuste ? { usar_nos_proximos: usarProximos } : {}),
    };
    setSalvando(true);
    try {
      let resposta;
      try {
        resposta = await api.salvarLancamento(data, { ...dados, recalcular_custo: recalcular });
      } catch (err) {
        // A API pede confirmação para valores suspeitos (ganho alto, ganho sem km).
        if (!err.confirmar || !window.confirm(err.message)) throw err.confirmar ? null : err;
        resposta = await api.salvarLancamento(data, { ...dados, recalcular_custo: recalcular, confirmado: true });
      }
      const msg = salvo ? 'Alterações salvas.' : 'Dia salvo. Bom trabalho!';
      // Se o combustível virou o padrão, o app passa a usar o perfil atualizado.
      onSalvo(resposta.perfil_atualizado ? `${msg} O combustível vale para os próximos dias.` : msg, resposta.perfil_atualizado);
    } catch (err) {
      if (err) setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  const kmTexto = numeroBR(paraNumero(form.km_rodados) || 0, paraNumero(form.km_rodados) % 1 ? 1 : 0);

  if (carga === 'erro') {
    return (
      <section className="cartao vazio">
        <KmIcon name="alerta" size={40} />
        <p>Não foi possível carregar este dia. Confira se o KM Real está rodando e tente de novo.</p>
        <button className="botao botao--secundario" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
      </section>
    );
  }

  return (
    <form className="pagina-form" onSubmit={salvar}>
      <div className="cartao pagina-form__campos">
        <h2 className="cartao__titulo">{salvo ? 'Editando um dia já lançado' : 'Novo dia'}</h2>
        <Campo rotulo={<><KmIcon name="calendario" size={18} /> Data</>} nome="data" tipo="date" valor={data} max={hojeISO()} onChange={(_, v) => setData(v || hojeISO())} />

        <fieldset className="campos" disabled={carga !== 'ok'}>
        <h3 className="grupo"><KmIcon name="ganhos" size={20} /> Ganhos do dia</h3>
        <p className="grupo__dica">Use o valor que caiu pra você, já sem a taxa do app. Ele aparece no resumo de ganhos da Uber e da 99.</p>
        <div className="duas-colunas">
          {apps.includes('uber') && <Campo rotulo="Uber" nome="ganho_uber" valor={form.ganho_uber} onChange={mudar} prefixo="R$" dica={DICA_TAXA} />}
          {apps.includes('99') && <Campo rotulo="99" nome="ganho_99" valor={form.ganho_99} onChange={mudar} prefixo="R$" dica={DICA_TAXA} />}
        </div>
        <Campo rotulo="Outros ganhos" nome="ganho_outros" valor={form.ganho_outros} onChange={mudar} prefixo="R$" dica="Gorjetas em dinheiro, corridas particulares." />

        <h3 className="grupo"><KmIcon name="quilometragem" size={20} /> Rodagem</h3>
        <div className="duas-colunas">
          <Campo rotulo="Km rodados" nome="km_rodados" valor={form.km_rodados} onChange={mudar} sufixo="km" dica="Pelo painel do carro." />
          <Campo rotulo="Horas online" nome="horas_trabalhadas" valor={form.horas_trabalhadas} onChange={mudar} sufixo="h" dica="Tempo logado nos apps." ler={lerHoras} caracteres={/[^\d.,:hH]/g} placeholder="8:30" />
        </div>
        <CombustivelDoDia
          previa={previa} perfil={perfil} ajuste={ajuste} onAjuste={(a) => { setErro(''); setAjuste(a); }}
          usarProximos={usarProximos} onUsarProximos={setUsarProximos}
        />

        <h3 className="grupo"><KmIcon name="gastos-extras" size={20} /> Outros gastos</h3>
        <Campo rotulo="Outros gastos do dia" nome="gastos_extras" valor={form.gastos_extras} onChange={mudar} prefixo="R$" dica="Lavagem, alimentação, pedágio, estacionamento. Não inclua combustível: ele já é descontado pelos km rodados." />
        <Campo rotulo="Observação" nome="observacao" valor={form.observacao} onChange={mudar} placeholder="Opcional" />
        </fieldset>
      </div>

      <aside className="pagina-form__resumo">
        {previa?.custo_mudou && salvo && (
          <div className="info">
            <KmIcon name="detalhar" size={20} />
            <div>
              <p>
                Este dia foi lançado com o custo de <strong>{moeda(salvo.custo_km_aplicado)}/km</strong>.
                Hoje o seu custo é <strong>{moeda(previa.custo_atual.total_km)}/km</strong>. Editar o dia não muda isso.
              </p>
              <label className="interruptor">
                <input type="checkbox" checked={recalcular} onChange={(e) => setRecalcular(e.target.checked)} />
                <span>Recalcular com o custo de hoje</span>
              </label>
            </div>
          </div>
        )}

        <div className="resultado">
          <p className="resultado__titulo"><KmIcon name="lucro-real" size={20} /> Como fica o seu dia</p>
          <div><span>Ganho bruto<small>Uber + 99 + outros</small></span><strong>{moeda(previa?.bruto)}</strong></div>
          {semSeparacao ? (
            <div><span>Custo do carro<small>{kmTexto} km × {moeda(custo.total_km)}/km</small></span><strong className="custo">−{moeda(previa?.combustivel)}</strong></div>
          ) : (
            <>
              <div><span>Combustível<small>{kmTexto} km × {moeda(custo.combustivel_km)}/km</small></span><strong className="custo">−{moeda(previa?.combustivel)}</strong></div>
              <div><span>Custos fixos do carro<small>{kmTexto} km × {moeda(custo.fixo_km)}/km</small></span><strong className="custo">−{moeda(previa?.fixo)}</strong></div>
            </>
          )}
          <div><span>Outros gastos do dia</span><strong className="custo">−{moeda(previa?.gastos)}</strong></div>
          <div className="resultado__total"><span>Lucro estimado</span><strong className={previa?.lucro < 0 ? 'neg' : 'pos'}>{moeda(previa?.lucro)}</strong></div>
          <p className="resultado__nota">
            {salvo && !recalcular
              ? 'O combustível e os custos fixos usam o custo por km do dia em que ele foi lançado.'
              : `O combustível e os custos fixos saem do custo por km do seu carro (${moeda(perfil.custo.total_km)}/km). Se esse valor parecer errado, ajuste na aba Perfil.`}
          </p>
        </div>

        {erro && <p className="erro">{erro}</p>}
        <div className="barra-acao">
          <div className="barra-acao__resumo">
            <span>Lucro estimado</span>
            <strong className={previa?.lucro < 0 ? 'neg' : 'pos'}>{moeda(previa?.lucro)}</strong>
          </div>
          {/* onMouseDown: tocar em salvar não tira o foco do campo, senão a tela se mexe no meio do toque */}
          <button className="botao" disabled={salvando || carga !== 'ok'} onMouseDown={(e) => e.preventDefault()}>
            <KmIcon name="confirmar" size={20} /> {salvando ? 'Salvando…' : salvo ? 'Salvar alterações' : 'Salvar dia'}
          </button>
        </div>
      </aside>
    </form>
  );
}
