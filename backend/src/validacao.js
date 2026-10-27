// Validações simples dos dados que chegam do front.
export function numero(valor, { campo, min = 0, obrigatorio = false, maiorQueZero = false }) {
  if (valor === undefined || valor === null || valor === '') {
    if (obrigatorio) throw erro(`Informe ${campo}.`);
    return 0;
  }
  const n = Number(valor);
  if (Number.isNaN(n)) throw erro(`${campo} precisa ser um número.`);
  if (maiorQueZero && n <= 0) throw erro(`${campo} precisa ser maior que zero.`);
  if (n < min) throw erro(`${campo} não pode ser negativo.`);
  return n;
}

export function dataISO(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) throw erro('Data inválida. Use o formato AAAA-MM-DD.');
  return valor;
}

export function erro(mensagem, status = 400) {
  const e = new Error(mensagem.charAt(0).toUpperCase() + mensagem.slice(1));
  e.status = status;
  return e;
}
