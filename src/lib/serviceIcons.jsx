// Íconos de las 5 categorías de servicio CuidAR 360
// Trazo SVG 2px, grilla 24×24, sin relleno, stroke hereda color del contexto.
// El segundo trazo usa agua clara (#3FB7A6) como acento de marca.

const base = { viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export function IconInfantil({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props} stroke="currentColor">
      <circle cx="12" cy="8.5" r="3.2"/>
      <path d="M5.5 20c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5"/>
      <path d="M3 10.5A9 9 0 0 1 12 2" stroke="#3FB7A6"/>
    </svg>
  )
}

export function IconPedagogico({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props} stroke="currentColor">
      <path d="M12 7.5C10.4 6 8.4 5.4 4 5.4v11c4.4 0 6.4.7 8 2.2 1.6-1.5 3.6-2.2 8-2.2v-11c-4.4 0-6.4.6-8 2.1z"/>
      <path d="M12 7.5v11.1" stroke="#3FB7A6"/>
    </svg>
  )
}

export function IconSalud({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props} stroke="currentColor">
      <path d="M20.5 12a8.5 8.5 0 1 1-4.2-7.3"/>
      <path d="M12 8v8M8 12h8" stroke="#3FB7A6"/>
    </svg>
  )
}

export function IconTerapeutico({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props} stroke="currentColor">
      <circle cx="8" cy="8" r="2.6"/>
      <circle cx="16.4" cy="9.4" r="2.2"/>
      <path d="M3 19.5c0-2.7 2.2-4.6 5-4.6s5 1.9 5 4.6"/>
      <path d="M14.6 19.5c0-2.2 1-3.6 3.2-3.6 1.6 0 2.7.8 3.1 2" stroke="#3FB7A6"/>
    </svg>
  )
}

export function IconLimpieza({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props} stroke="currentColor">
      <path d="M3.5 10.5 12 3.5l8.5 7"/>
      <path d="M5.8 12.4v7.1h12.4v-7.1"/>
      <path d="M9.6 19.5v-4.3h4.8v4.3" stroke="#3FB7A6"/>
    </svg>
  )
}

export const SERVICE_ICONS = {
  infantil:    IconInfantil,
  pedagogico:  IconPedagogico,
  salud:       IconSalud,
  terapeutico: IconTerapeutico,
  limpieza:    IconLimpieza,
}

export function getCatIcon(categories) {
  const primary = Array.isArray(categories) ? categories[0] : categories
  return SERVICE_ICONS[primary] ?? null
}
