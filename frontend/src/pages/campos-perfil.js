// Valores do perfil como texto, para preencher os inputs (vírgula no lugar do ponto).
const txt = (v) => (v === null || v === undefined || v === 0 ? '' : String(v).replace('.', ','));

export function perfilParaForm(p) {
  return {
    nome: p?.nome || '',
    apps: p?.apps || 'uber,99',
    meta_diaria: txt(p?.meta_diaria),
    modelo_veiculo: p?.modelo_veiculo || '',
    consumo_km_l: txt(p?.consumo_km_l),
    preco_combustivel: txt(p?.preco_combustivel),
    custos_fixos_mensais: txt(p?.custos_fixos_mensais),
    km_mensal_estimado: txt(p?.km_mensal_estimado),
  };
}

const n = (v) => Number(String(v).replace(',', '.')) || 0;

export function formParaPerfil(f) {
  return {
    ...f,
    meta_diaria: n(f.meta_diaria),
    consumo_km_l: n(f.consumo_km_l),
    preco_combustivel: n(f.preco_combustivel),
    custos_fixos_mensais: n(f.custos_fixos_mensais),
    km_mensal_estimado: n(f.km_mensal_estimado),
  };
}

// Prévia do custo por km enquanto o motorista preenche.
export function previaCusto(f) {
  const combustivel = n(f.consumo_km_l) > 0 ? n(f.preco_combustivel) / n(f.consumo_km_l) : 0;
  const fixo = n(f.km_mensal_estimado) > 0 ? n(f.custos_fixos_mensais) / n(f.km_mensal_estimado) : 0;
  return { combustivel, fixo, total: combustivel + fixo };
}
