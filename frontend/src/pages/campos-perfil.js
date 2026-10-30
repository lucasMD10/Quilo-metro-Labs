import { lerNumero } from '../util.js';

// Valores do perfil como texto, para preencher os inputs (vírgula no lugar do ponto).
const txt = (v) => (v === null || v === undefined || v === 0 ? '' : String(v).replace('.', ','));
const n = (v) => lerNumero(v) || 0;

// Combustíveis que o carro pode usar. Aditivada é gasolina (muda só o preço).
export const COMBUSTIVEIS = [['gasolina', 'Gasolina'], ['etanol', 'Etanol']];
export const usaCombustivel = (f, c) => String(f.combustiveis || '').split(',').includes(c);

// Custos fixos do carro, um campo para cada. O IPVA é pedido por ano (é como o motorista conhece).
// Tudo aqui é dinheiro que sai do bolso: o lucro do app é a sobra no bolso. Por isso a antiga
// "depreciação" virou uma reserva opcional para a troca do carro (a coluna continua custo_depreciacao).
export const CUSTOS_FIXOS = [
  { nome: 'custo_parcela', rotulo: 'Parcela ou aluguel do carro', sufixo: '/mês' },
  { nome: 'custo_seguro', rotulo: 'Seguro', periodo: true, dica: 'Do jeito que você paga: a parcela do mês ou o valor do ano.' },
  { nome: 'custo_ipva', rotulo: 'IPVA e licenciamento', sufixo: '/ano', dica: 'Valor do ano inteiro. O app divide por 12.' },
  { nome: 'custo_manutencao', rotulo: 'Manutenção', periodo: true, dica: 'Óleo, pneus, freios e revisão. Se for mais fácil, informe o total do ano.' },
  { nome: 'custo_depreciacao', rotulo: 'Reserva para trocar de carro', sufixo: '/mês', dica: 'Opcional. Quanto você separa por mês para a troca do carro.' },
  { nome: 'custo_outros', rotulo: 'Outros custos fixos', sufixo: '/mês', dica: 'Rastreador, internet do celular, contador.' },
];

// Os perfis antigos (sem os custos detalhados) já chegam completados pela API.
export function perfilParaForm(p) {
  return {
    nome: p?.nome || '',
    apps: p?.apps || 'uber,99',
    meta_diaria: txt(p?.meta_diaria),
    modelo_veiculo: p?.modelo_veiculo || '',
    combustiveis: p?.combustiveis || 'gasolina',
    combustivel_padrao: p?.combustivel_padrao || 'gasolina',
    ...Object.fromEntries(COMBUSTIVEIS.flatMap(([c]) => [[`preco_${c}`, txt(p?.[`preco_${c}`])], [`consumo_${c}`, txt(p?.[`consumo_${c}`])]])),
    km_por_dia: txt(p?.km_por_dia),
    dias_por_semana: String(p?.dias_por_semana || 6),
    ...Object.fromEntries(CUSTOS_FIXOS.map((c) => [c.nome, txt(p?.[c.nome])])),
    // Seguro e manutenção: 'mes' ou 'ano', do jeito que o motorista informou.
    ...Object.fromEntries(CUSTOS_FIXOS.filter((c) => c.periodo).map((c) => [`${c.nome}_periodo`, p?.[`${c.nome}_periodo`] || 'mes'])),
  };
}

const NUMERICOS = ['meta_diaria', 'km_por_dia', 'dias_por_semana', ...CUSTOS_FIXOS.map((c) => c.nome),
  ...COMBUSTIVEIS.flatMap(([c]) => [`preco_${c}`, `consumo_${c}`])];

export function formParaPerfil(f) {
  return { ...f, ...Object.fromEntries(NUMERICOS.map((k) => [k, n(f[k])])) };
}

// true se algum campo numérico visível tem texto que não é número (o campo já aparece em vermelho).
// Campos de um combustível desmarcado ficam escondidos e não contam.
export const temNumeroInvalido = (f) => NUMERICOS
  .filter((k) => !COMBUSTIVEIS.some(([c]) => k.endsWith(`_${c}`) && !usaCombustivel(f, c)))
  .some((k) => Number.isNaN(lerNumero(f[k])));
