export const CAT_STYLES = {
  infantil:    { bg: 'bg-pink-50',   border: 'border-pink-200',   avatarBg: 'bg-pink-100',   badge: 'bg-pink-100 text-pink-700',    label: 'Cuidado Infantil' },
  pedagogico:  { bg: 'bg-yellow-50', border: 'border-yellow-200', avatarBg: 'bg-yellow-100', badge: 'bg-yellow-100 text-yellow-700', label: 'Apoyo Pedagógico' },
  salud:       { bg: 'bg-sky-50',    border: 'border-sky-200',    avatarBg: 'bg-sky-100',    badge: 'bg-sky-100 text-sky-700',      label: 'Salud Pediátrica' },
  terapeutico: { bg: 'bg-green-50',  border: 'border-green-200',  avatarBg: 'bg-green-100',  badge: 'bg-green-100 text-green-700',  label: 'Cuidado Terapéutico' },
  limpieza:    { bg: 'bg-orange-50', border: 'border-orange-200', avatarBg: 'bg-orange-100', badge: 'bg-orange-100 text-orange-700', label: 'Limpieza del Hogar' },
}

export const DEFAULT_CAT_STYLE = {
  bg: 'bg-slate-50', border: 'border-slate-200', avatarBg: 'bg-slate-100',
  badge: 'bg-slate-100 text-slate-600', label: '',
}

export function getCatStyle(categories) {
  const primary = Array.isArray(categories) ? categories[0] : categories
  return CAT_STYLES[primary] ?? DEFAULT_CAT_STYLE
}
