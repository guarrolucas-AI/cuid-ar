// Reglas de visibilidad de datos de un profesional según el nivel del
// visitante (ver ARQUITECTURA DE PRIVACIDAD Y NIVELES DE ACCESO).
//
// - Visitante / no abonado: foto, nombre, servicios, costo estimado y
//   verificado. Nada de contacto directo.
// - Abonado y verificado (status === 'subscribed'): además, certificaciones
//   declaradas y la tarifa oficial de referencia junto a la pretendida
//   (disponibilidad horaria detallada queda para cuando exista ese campo).
// - Teléfono, mail, DNI y dirección exacta NUNCA se devuelven acá bajo
//   ninguna circunstancia — eso solo se intercambia dentro del chat privado
//   post-match, por decisión de las partes, no expuesto por la API.
export function toProfessionalView(pro, viewerSubscribed, officialRate = null) {
  const base = {
    userId: pro.userId,
    name: pro.name,
    zone: pro.zone,
    categories: pro.categories ?? [],
    hourlyRate: pro.hourlyRate,
    verified: pro.verified,
    photoUrl: pro.photoUrl ?? null,
    ...(pro.distanceKm != null && { distanceKm: Math.round(pro.distanceKm * 10) / 10 }),
  }

  if (!viewerSubscribed) return base

  return {
    ...base,
    certifications: pro.certifications ?? [],
    officialRate,
  }
}
