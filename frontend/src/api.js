// Funções que conversam com o backend. Todas devolvem uma Promise com o JSON da resposta.
async function chamar(caminho, opcoes = {}) {
  const resp = await fetch(`/api${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });
  if (resp.status === 204) return null;
  const dados = await resp.json().catch(() => null);
  if (!resp.ok) {
    const erro = new Error(dados?.erro || 'Não foi possível falar com o servidor.');
    erro.status = resp.status; // 404 = não existe; o resto é falha de verdade
    throw erro;
  }
  return dados;
}

export const api = {
  perfil: () => chamar('/perfil'),
  salvarPerfil: (dados) => chamar('/perfil', { method: 'PUT', body: dados }),
  resumo: (ate, dias = 7) => chamar(`/resumo?ate=${ate}&dias=${dias}`),
  lancamentos: () => chamar('/lancamentos'),
  lancamento: (data) => chamar(`/lancamentos/${data}`),
  salvarLancamento: (data, dados) => chamar(`/lancamentos/${data}`, { method: 'PUT', body: dados }),
  excluirLancamento: (data) => chamar(`/lancamentos/${data}`, { method: 'DELETE' }),
};
