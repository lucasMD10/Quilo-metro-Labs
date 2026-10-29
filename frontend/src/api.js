import { apiNavegador } from './api-navegador.js';

// Na versão do GitHub Pages (build com --mode pages) não há backend: tudo roda no navegador.
// __MODO_NAVEGADOR__ é trocado por true ou false na hora do build (vite.config.js).
export const MODO_NAVEGADOR = __MODO_NAVEGADOR__;

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

const apiServidor = {
  perfil: () => chamar('/perfil'),
  salvarPerfil: (dados) => chamar('/perfil', { method: 'PUT', body: dados }),
  resumo: (ate, dias = 7) => chamar(`/resumo?ate=${ate}&dias=${dias}`),
  fechamento: (mes, hoje) => chamar(`/resumo/mes?mes=${mes}&hoje=${hoje}`),
  lancamentos: () => chamar('/lancamentos'),
  lancamento: (data) => chamar(`/lancamentos/${data}`),
  salvarLancamento: (data, dados) => chamar(`/lancamentos/${data}`, { method: 'PUT', body: dados }),
  excluirLancamento: (data) => chamar(`/lancamentos/${data}`, { method: 'DELETE' }),
};

export const api = MODO_NAVEGADOR ? apiNavegador : apiServidor;
