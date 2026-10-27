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

// Mesmo cálculo do backend, usado para mostrar a prévia enquanto o motorista digita.
export function previaDoDia(form, custoKm) {
  const n = (v) => Number(String(v).replace(',', '.')) || 0;
  const bruto = n(form.ganho_uber) + n(form.ganho_99) + n(form.ganho_outros);
  const custo = n(form.km_rodados) * custoKm + n(form.gastos_extras);
  return { bruto, custo, lucro: bruto - custo };
}

// Converte "12,5" -> 12.5 antes de mandar para a API.
export const paraNumero = (v) => (v === '' || v === null || v === undefined ? 0 : Number(String(v).replace(',', '.')));
