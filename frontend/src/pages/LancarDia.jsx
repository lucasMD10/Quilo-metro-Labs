import { useEffect, useState } from 'react';
import Campo from '../components/Campo.jsx';
import { api } from '../api.js';
import { moeda, hojeISO, previaDoDia, paraNumero } from '../util.js';

const VAZIO = { ganho_uber: '', ganho_99: '', ganho_outros: '', km_rodados: '', horas_trabalhadas: '', gastos_extras: '', observacao: '' };
const txt = (v) => (v ? String(v).replace('.', ',') : '');

export default function LancarDia({ perfil, dataInicial, onSalvo }) {
  const [data, setData] = useState(dataInicial || hojeISO());
  const [form, setForm] = useState(VAZIO);
  const [existe, setExiste] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const apps = perfil.apps.split(',');
  const mudar = (nome, valor) => setForm((f) => ({ ...f, [nome]: valor }));

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

  const previa = previaDoDia(form, perfil.custo.total_km);

  async function salvar(e) {
    e.preventDefault();
    setErro('');
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

  return (
    <form className="painel" onSubmit={salvar}>
      <h2>{existe ? 'Editar dia' : 'Lançar dia'}</h2>
      <Campo rotulo="Data" nome="data" tipo="date" valor={data} max={hojeISO()} onChange={(_, v) => setData(v)} />

      <div className="duas-colunas">
        {apps.includes('uber') && <Campo rotulo="Ganho na Uber" nome="ganho_uber" valor={form.ganho_uber} onChange={mudar} prefixo="R$" />}
        {apps.includes('99') && <Campo rotulo="Ganho na 99" nome="ganho_99" valor={form.ganho_99} onChange={mudar} prefixo="R$" />}
      </div>
      <Campo rotulo="Outros ganhos" nome="ganho_outros" valor={form.ganho_outros} onChange={mudar} prefixo="R$" dica="Gorjetas em dinheiro, corridas particulares." />

      <div className="duas-colunas">
        <Campo rotulo="Km rodados" nome="km_rodados" valor={form.km_rodados} onChange={mudar} sufixo="km" />
        <Campo rotulo="Horas online" nome="horas_trabalhadas" valor={form.horas_trabalhadas} onChange={mudar} sufixo="h" />
      </div>
      <Campo rotulo="Gastos do dia" nome="gastos_extras" valor={form.gastos_extras} onChange={mudar} prefixo="R$" dica="Lavagem, alimentação, pedágio, estacionamento." />
      <Campo rotulo="Observação" nome="observacao" valor={form.observacao} onChange={mudar} placeholder="Opcional" />

      <div className="resultado">
        <div><span>Ganho bruto</span><strong>{moeda(previa.bruto)}</strong></div>
        <div><span>Custo do carro e gastos</span><strong>−{moeda(previa.custo)}</strong></div>
        <div className="resultado__lucro"><span>Lucro real</span><strong className={previa.lucro < 0 ? 'neg' : ''}>{moeda(previa.lucro)}</strong></div>
      </div>

      {erro && <p className="erro">{erro}</p>}
      <button className="botao" disabled={salvando}>{salvando ? 'Salvando…' : existe ? 'Salvar alterações' : 'Salvar dia'}</button>
    </form>
  );
}
