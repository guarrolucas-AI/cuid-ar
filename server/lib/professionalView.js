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
function calcProfileScore(pro) {
  let score = 0
  if (pro.photoUrl)                                    score++
  if (pro.name && pro.zone)                            score++
  if ((pro.categories?.length ?? 0) > 0 && pro.hourlyRate > 0) score++
  if (pro.bio && pro.bio.trim().length > 20)           score++
  if (pro.verified)                                    score++
  return score
}

export { calcProfileScore }

export function toProfessionalView(pro, viewerSubscribed, officialRate = null) {
  const profileScore = calcProfileScore(pro)
  const base = {
    userId: pro.userId,
    name: pro.name,
    zone: pro.zone,
    categories: pro.categories ?? [],
    hourlyRate: pro.hourlyRate,
    verified: pro.verified,
    onDuty: pro.onDuty ?? false,
    photoUrl: pro.photoUrl ?? null,
    profileScore,
    profileComplete: profileScore === 5,
    ...(pro.distanceKm != null && { distanceKm: Math.round(pro.distanceKm * 10) / 10 }),
  }

  if (!viewerSubscribed) return base

  return {
    ...base,
    certifications: pro.certifications ?? [],
    officialRate,
  }
}
