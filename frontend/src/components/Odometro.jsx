import { moeda } from '../util.js';

// Mostra um valor em reais como um odômetro: cada dígito numa "casinha".
export default function Odometro({ valor }) {
  const negativo = valor < 0;
  const texto = moeda(Math.abs(valor)).replace('R$', '').trim();
  return (
    <div className={`odometro ${negativo ? 'odometro--negativo' : ''}`} aria-label={moeda(valor)}>
      <span className="odometro__moeda">{negativo ? '−R$' : 'R$'}</span>
      {texto.split('').map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className="odometro__digito">{c}</span>
        ) : (
          <span key={i} className="odometro__sep">{c}</span>
        )
      )}
    </div>
  );
}
