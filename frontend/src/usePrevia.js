import { useEffect, useState } from 'react';

// Pede uma prévia de cálculo à API enquanto o motorista digita (com uma pequena espera entre as teclas).
// As contas ficam no backend; o front só mostra o resultado. Se a API recusar um valor no meio da digitação,
// a última prévia válida continua na tela e o erro aparece ao salvar.
export function usePrevia(buscar, entrada, ativo = true) {
  const [previa, setPrevia] = useState(null);
  const chave = JSON.stringify(entrada);
  useEffect(() => {
    if (!ativo) return undefined;
    let atual = true;
    const t = setTimeout(() => {
      buscar(entrada).then((p) => atual && setPrevia(p)).catch(() => {});
    }, 150);
    return () => { atual = false; clearTimeout(t); };
  }, [chave, ativo]); // eslint-disable-line react-hooks/exhaustive-deps
  return previa;
}
