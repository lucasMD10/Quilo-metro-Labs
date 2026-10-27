import { iconPaths } from './icon-paths.js';

// Ícones do KM Real (grade 24×24, traço 1,8). Herdam a cor do texto (currentColor).
// São decorativos ao lado de texto; em botão só com ícone, coloque aria-label no botão.
export default function KmIcon({ name, size = 24, ...props }) {
  const path = iconPaths[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d={path} />
    </svg>
  );
}
