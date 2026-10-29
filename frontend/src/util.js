const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const moeda = (v) => formatoMoeda.format(v || 0);
export const numeroBR = (v, casas = 0) =>
  (v || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

// Data de hoje no fuso do aparelho, no formato AAAA-MM-DD.
export const hojeISO = () => new Date().toLocaleDateString('sv-SE');

const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const diaCurto = (iso) => diaSemana[new Date(`${iso}T12:00:00`).getDay()];
export const dataBR = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

/**
 * Lê um número digitado do jeito brasileiro. Devolve 0 para campo vazio e NaN para texto inválido.
 *  "6" -> 6 · "6,00" -> 6 · "6.29" -> 6.29 · "1.000" -> 1000 · "1.000,50" -> 1000.5 · "abc" -> NaN
 */
export function lerNumero(valor) {
  let t = String(valor ?? '').replace(/R\$|\s/g, '').replace(/[.,]$/, ''); // "6," é alguém digitando os centavos
  if (t === '') return 0;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.'); // vírgula é o decimal, pontos são milhar
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, ''); // "1.000" e "12.500" são milhar
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

/** Horas como o motorista escreve: "8:30", "8h30", "8h" ou "8,5" -> 8.5. Texto inválido -> NaN. */
export function lerHoras(valor) {
  const t = String(valor ?? '').toLowerCase().replace(/\s/g, '');
  const m = t.match(/^(\d{1,2})(?::|h)(\d{0,2})(?:min|m)?$/);
  if (m) {
    const minutos = m[2] ? Number(m[2]) : 0;
    return minutos < 60 ? Number(m[1]) + minutos / 60 : NaN;
  }
  return lerNumero(t);
}

/** 8.5 -> "8h30" e 8 -> "8", para mostrar as horas já lançadas do jeito que se fala. */
export function horasTexto(h) {
  if (!h) return '';
  const inteiras = Math.floor(h);
  const minutos = Math.round((h - inteiras) * 60);
  return minutos ? `${inteiras}h${String(minutos).padStart(2, '0')}` : String(inteiras);
}

// Converte "12,5" -> 12.5 antes de mandar para a API.
export const paraNumero = (v) => lerNumero(v);
