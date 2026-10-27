import { useEffect, useRef, useState } from 'react';
import { moeda } from '../util.js';

const semMovimento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Valor em reais que "corre" do valor anterior até o novo, como um contador.
export default function ValorAnimado({ valor, className = '' }) {
  const [mostrado, setMostrado] = useState(semMovimento() ? valor : 0);
  const anterior = useRef(mostrado);

  useEffect(() => {
    if (semMovimento()) { setMostrado(valor); return; }
    const inicio = performance.now();
    const de = anterior.current;
    let quadro;
    const passo = (agora) => {
      const t = Math.min((agora - inicio) / 700, 1);
      const suave = 1 - (1 - t) ** 3;
      const atual = de + (valor - de) * suave;
      setMostrado(atual);
      anterior.current = atual;
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor]);

  return <span className={`valor ${valor < 0 ? 'valor--neg' : ''} ${className}`} aria-label={moeda(valor)}>{moeda(mostrado)}</span>;
}
