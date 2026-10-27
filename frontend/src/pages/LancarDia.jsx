import { useEffect, useState } from 'react';
import Campo from '../components/Campo.jsx';
import KmIcon from '../components/KmIcon.jsx';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO, previaDoDia, paraNumero } from '../util.js';

const NUMERICOS = ['ganho_uber', 'ganho_99', 'ganho_outros', 'km_rodados', 'horas_trabalhadas', 'gastos_extras'];

const VAZIO = { ganho_uber: '', ganho_99: '', ganho_outros: '', km_rodados: '', horas_trabalhadas: '', gastos_extras: '', observacao: '' };
const txt = (v) => (v ? String(v).replace('.', ',') : '');
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
  const apps = perfil.apps.split(',');
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  // Ao trocar a data, carrega o lançamento daquele dia (se já existir) para editar.
  // Só um 404 significa "dia sem lançamento"; qualquer outra falha não pode virar formulário vazio.
  useEffect(() => {
    let atual = true; // vira false se a data mudar antes da resposta chegar
    setErro('');
    setCarga('carregando');
    setRecalcular(false);
    api.lancamento(data)
      .then((l) => {
        if (!atual) return;
        setSalvo(l);
        setForm({
          ganho_uber: txt(l.ganho_uber), ganho_99: txt(l.ganho_99), ganho_outros: txt(l.ganho_outros),
          km_rodados: txt(l.km_rodados), horas_trabalhadas: txt(l.horas_trabalhadas),
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

  // Dia já lançado usa o custo por km da época, a não ser que o motorista peça para recalcular.
  const custoDaEpoca = salvo && {
    total_km: salvo.custo_km_aplicado,
    combustivel_km: salvo.combustivel_km_aplicado,
    fixo_km: salvo.fixo_km_aplicado,
  };
  const custo = custoDaEpoca && !recalcular ? custoDaEpoca : perfil.custo;
  const custoMudou = custoDaEpoca && Math.abs(custoDaEpoca.total_km - perfil.custo.total_km) >= 0.005;
  const semSeparacao = custo.combustivel_km == null; // dia lançado antes de existir a separação
  const previa = previaDoDia(form, custo);

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (NUMERICOS.some((k) => Number.isNaN(paraNumero(form[k])))) return setErro('Corrija os campos marcados em vermelho.');
    const v = Object.fromEntries(NUMERICOS.map((k) => [k, paraNumero(form[k])]));
    const ganhos = v.ganho_uber + v.ganho_99 + v.ganho_outros;
    if (NUMERICOS.every((k) => !v[k])) return setErro('O dia está vazio. Preencha pelo menos os ganhos ou os km rodados.');
    if (v.horas_trabalhadas > 24) return setErro('Um dia tem no máximo 24 horas. Confira as horas online.');
    if (v.km_rodados > 1500) return setErro('Mais de 1.500 km num dia não parece real. Confira os km rodados.');
    if (ganhos > 0 && !v.km_rodados && !window.confirm('Você lançou ganhos sem km rodados, então nenhum custo do carro será descontado. Salvar assim mesmo?')) return;
    setSalvando(true);
    try {
      const dados = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, k === 'observacao' ? v : paraNumero(v)])
      );
      await api.salvarLancamento(data, { ...dados, recalcular_custo: recalcular });
      onSalvo(salvo ? 'Alterações salvas.' : 'Dia salvo. Bom trabalho!');
    } catch (err) {
      setErro(err.message);
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
        <Campo rotulo={<><KmIcon name="calendario" size={18} /> Data</>} nome="data" tipo="date" valor={data} max={hojeISO()} onChange={(_, v) => setData(v)} />

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
          <Campo rotulo="Horas online" nome="horas_trabalhadas" valor={form.horas_trabalhadas} onChange={mudar} sufixo="h" dica="Tempo logado nos apps." />
        </div>

        <h3 className="grupo"><KmIcon name="gastos-extras" size={20} /> Outros gastos</h3>
        <Campo rotulo="Outros gastos do dia" nome="gastos_extras" valor={form.gastos_extras} onChange={mudar} prefixo="R$" dica="Lavagem, alimentação, pedágio, estacionamento. Não inclua combustível: ele já é descontado pelos km rodados." />
        <Campo rotulo="Observação" nome="observacao" valor={form.observacao} onChange={mudar} placeholder="Opcional" />
        </fieldset>
      </div>

      <aside className="pagina-form__resumo">
        {custoMudou && (
          <div className="info">
            <KmIcon name="detalhar" size={20} />
            <div>
              <p>
                Este dia foi lançado com o custo de <strong>{moeda(custoDaEpoca.total_km)}/km</strong>.
                Hoje o seu custo é <strong>{moeda(perfil.custo.total_km)}/km</strong>. Editar o dia não muda isso.
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
          <div><span>Ganho bruto<small>Uber + 99 + outros</small></span><strong>{moeda(previa.bruto)}</strong></div>
          {semSeparacao ? (
            <div><span>Custo do carro<small>{kmTexto} km × {moeda(custo.total_km)}/km</small></span><strong className="custo">−{moeda(previa.combustivel)}</strong></div>
          ) : (
            <>
              <div><span>Combustível<small>{kmTexto} km × {moeda(custo.combustivel_km)}/km</small></span><strong className="custo">−{moeda(previa.combustivel)}</strong></div>
              <div><span>Custos fixos do carro<small>{kmTexto} km × {moeda(custo.fixo_km)}/km</small></span><strong className="custo">−{moeda(previa.fixo)}</strong></div>
            </>
          )}
          <div><span>Outros gastos do dia</span><strong className="custo">−{moeda(previa.gastos)}</strong></div>
          <div className="resultado__total"><span>Lucro real</span><strong className={previa.lucro < 0 ? 'neg' : 'pos'}>{moeda(previa.lucro)}</strong></div>
          <p className="resultado__nota">
            {salvo && !recalcular
              ? 'O combustível e os custos fixos usam o custo por km do dia em que ele foi lançado.'
              : `O combustível e os custos fixos saem do custo por km do seu carro (${moeda(perfil.custo.total_km)}/km). Se esse valor parecer errado, ajuste na aba Perfil.`}
          </p>
        </div>

        {erro && <p className="erro">{erro}</p>}
        <div className="barra-acao">
          <div className="barra-acao__resumo">
            <span>Lucro real</span>
            <strong className={previa.lucro < 0 ? 'neg' : 'pos'}>{moeda(previa.lucro)}</strong>
          </div>
          <button className="botao" disabled={salvando || carga !== 'ok'}>
            <KmIcon name="confirmar" size={20} /> {salvando ? 'Salvando…' : salvo ? 'Salvar alterações' : 'Salvar dia'}
          </button>
        </div>
      </aside>
    </form>
  );
}
