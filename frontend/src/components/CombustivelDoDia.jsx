import { useState } from 'react';
import Campo from './Campo.jsx';
import KmIcon from './KmIcon.jsx';
import Segmentado from './Segmentado.jsx';
import { moeda, numeroBR } from '../util.js';
import { COMBUSTIVEIS } from '../pages/campos-perfil.js';

const txt = (v) => (v ? String(v).replace('.', ',') : '');
const NOME = Object.fromEntries(COMBUSTIVEIS);

// Combustível estimado do dia, com os valores usados na conta à vista e um "Ajustar" para quem abasteceu
// com outro preço ou combustível. Só mostra e coleta: a conta e a validação ficam na API.
// ajuste: null enquanto o motorista não mexe (vale o padrão ou o congelado do dia).
export default function CombustivelDoDia({ previa, perfil, ajuste, onAjuste, usarProximos, onUsarProximos }) {
  const [aberto, setAberto] = useState(false);
  const info = previa?.combustivel_info;
  const valores = ajuste || { tipo: info?.tipo || perfil.combustivel_padrao || 'gasolina', preco: txt(info?.preco), consumo: txt(info?.consumo) };

  function trocarTipo(tipo) {
    if (tipo === valores.tipo) return;
    // Cada combustível vem com o preço e o consumo que o perfil já conhece dele.
    onAjuste({ tipo, preco: txt(perfil[`preco_${tipo}`]), consumo: txt(perfil[`consumo_${tipo}`]) });
  }
  const mudar = (nome, valor) => onAjuste({ ...valores, [nome === 'combustivel_preco' ? 'preco' : 'consumo']: valor });

  // Dias lançados antes do registro do combustível só têm o custo por km.
  const resumo = info?.preco
    ? `${NOME[info.tipo] || 'Combustível'} · ${moeda(info.preco)}/l · ${numeroBR(info.consumo, info.consumo % 1 ? 1 : 0)} km/l`
    : `${moeda(previa?.custo?.combustivel_km ?? previa?.custo?.total_km)} por km`;

  return (
    <div className="combustivel-dia">
      <div className="combustivel-dia__linha">
        <span><KmIcon name="combustivel" size={18} /> Combustível estimado</span>
        <strong>{moeda(previa?.combustivel)}</strong>
      </div>
      <div className="combustivel-dia__params">
        <span>{resumo}</span>
        <button type="button" className="link-botao" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
          <KmIcon name="editar" size={16} /> {aberto ? 'Fechar' : 'Ajustar'}
        </button>
      </div>
      {!aberto && <p className="campo__dica">Abasteceu com outro preço ou combustível? Ajuste aqui.</p>}
      {aberto && (
        <div className="combustivel-dia__ajuste">
          <div className="campo">
            <span className="campo__rotulo">Combustível</span>
            <Segmentado opcoes={COMBUSTIVEIS} valor={valores.tipo} onChange={trocarTipo} rotulo="Combustível do dia" />
          </div>
          <div className="duas-colunas">
            <Campo rotulo="Preço do litro" nome="combustivel_preco" valor={valores.preco} onChange={mudar} prefixo="R$" />
            <Campo rotulo="Km por litro" nome="combustivel_consumo" valor={valores.consumo} onChange={mudar} sufixo="km/l" />
          </div>
          <label className="interruptor">
            <input type="checkbox" checked={usarProximos} onChange={(e) => onUsarProximos(e.target.checked)} />
            <span>Usar nos próximos dias</span>
          </label>
        </div>
      )}
    </div>
  );
}
