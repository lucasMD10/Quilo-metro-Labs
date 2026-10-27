import { useEffect, useState } from 'react';
import Campo from '../components/Campo.jsx';
import KmIcon from '../components/KmIcon.jsx';
import { api } from '../api.js';
import { moeda, numeroBR, hojeISO, previaDoDia, paraNumero } from '../util.js';

const NUMERICOS = ['ganho_uber', 'ganho_99', 'ganho_outros', 'km_rodados', 'horas_trabalhadas', 'gastos_extras'];

const VAZIO = { ganho_uber: '', ganho_99: '', ganho_outros: '', km_rodados: '', horas_trabalhadas: '', gastos_extras: '', observacao: '' };
const txt = (v) => (v ? String(v).replace('.', ',') : '');

export default function LancarDia({ perfil, dataInicial, onSalvo }) {
  const [data, setData] = useState(dataInicial || hojeISO());
  const [form, setForm] = useState(VAZIO);
  const [existe, setExiste] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const apps = perfil.apps.split(',');
  const mudar = (nome, valor) => { setErro(''); setForm((f) => ({ ...f, [nome]: valor })); };

  // Ao trocar a data, carrega o lançamento daquele dia (se já existir) para editar.
  useEffect(() => {
    setErro('');
    api.lancamento(data)
      .then((l) => {
        setExiste(true);
        setForm({
          ganho_uber: txt(l.ganho_uber), ganho_99: txt(l.ganho_99), ganho_outros: txt(l.ganho_outros),
          km_rodados: txt(l.km_rodados), horas_trabalhadas: txt(l.horas_trabalhadas),
          gastos_extras: txt(l.gastos_extras), observacao: l.observacao || '',
        });
      })
      .catch(() => { setExiste(false); setForm(VAZIO); });
  }, [data]);

  const previa = previaDoDia(form, perfil.custo);

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (NUMERICOS.some((k) => Number.isNaN(paraNumero(form[k])))) return setErro('Corrija os campos marcados em vermelho.');
    setSalvando(true);
    try {
      const dados = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, k === 'observacao' ? v : paraNumero(v)])
      );
      await api.salvarLancamento(data, dados);
      onSalvo();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  const kmTexto = numeroBR(paraNumero(form.km_rodados) || 0, paraNumero(form.km_rodados) % 1 ? 1 : 0);

  return (
    <form className="pagina-form" onSubmit={salvar}>
      <div className="cartao pagina-form__campos">
        <h2 className="cartao__titulo">{existe ? 'Editando um dia já lançado' : 'Novo dia'}</h2>
        <Campo rotulo={<><KmIcon name="calendario" size={18} /> Data</>} nome="data" tipo="date" valor={data} max={hojeISO()} onChange={(_, v) => setData(v)} />

        <h3 className="grupo"><KmIcon name="ganhos" size={20} /> Ganhos do dia</h3>
        <div className="duas-colunas">
          {apps.includes('uber') && <Campo rotulo="Uber" nome="ganho_uber" valor={form.ganho_uber} onChange={mudar} prefixo="R$" />}
          {apps.includes('99') && <Campo rotulo="99" nome="ganho_99" valor={form.ganho_99} onChange={mudar} prefixo="R$" />}
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
      </div>

      <aside className="pagina-form__resumo">
        <div className="resultado">
          <p className="resultado__titulo"><KmIcon name="lucro-real" size={20} /> Como fica o seu dia</p>
          <div><span>Ganho bruto<small>Uber + 99 + outros</small></span><strong>{moeda(previa.bruto)}</strong></div>
          <div><span>Combustível<small>{kmTexto} km × {moeda(perfil.custo.combustivel_km)}/km</small></span><strong className="custo">−{moeda(previa.combustivel)}</strong></div>
          <div><span>Custos fixos do carro<small>{kmTexto} km × {moeda(perfil.custo.fixo_km)}/km</small></span><strong className="custo">−{moeda(previa.fixo)}</strong></div>
          <div><span>Outros gastos do dia</span><strong className="custo">−{moeda(previa.gastos)}</strong></div>
          <div className="resultado__total"><span>Lucro real</span><strong className={previa.lucro < 0 ? 'neg' : 'pos'}>{moeda(previa.lucro)}</strong></div>
          <p className="resultado__nota">O combustível e os custos fixos saem do custo por km do seu carro ({moeda(perfil.custo.total_km)}/km). Se esse valor parecer errado, ajuste na aba Veículo.</p>
        </div>

        {erro && <p className="erro">{erro}</p>}
        <button className="botao" disabled={salvando}>
          <KmIcon name="confirmar" size={20} /> {salvando ? 'Salvando…' : existe ? 'Salvar alterações' : 'Salvar dia'}
        </button>
      </aside>
    </form>
  );
}
