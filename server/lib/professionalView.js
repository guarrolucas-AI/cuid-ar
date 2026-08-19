// Reglas de visibilidad de datos de un profesional según el nivel del
// visitante (ver ARQUITECTURA DE PRIVACIDAD Y NIVELES DE ACCESO).
//
// - Visitante / no abonado: foto, nombre, servicios, costo estimado y
//   verificado. Nada de contacto directo.
// - Abonado y verificado (status === 'subscribed'): además, certificaciones
//   declaradas. Disponibilidad horaria y tarifa oficial de referencia se
//   suman cuando esos módulos existan (geolocalización / aranceles).
// - Teléfono, mail, DNI y dirección exacta NUNCA se devuelven acá bajo
//   ninguna circunstancia — eso solo se intercambia dentro del chat privado
//   post-match, por decisión de las partes, no expuesto por la API.
export function toProfessionalView(pro, viewerSubscribed) {
  const base = {
    userId: pro.userId,
    name: pro.name,
    zone: pro.zone,
    category: pro.category,
    hourlyRate: pro.hourlyRate,
    verified: pro.verified,
    photoUrl: pro.photoUrl ?? null,
  }

  if (!viewerSubscribed) return base

  return {
    ...base,
    certifications: pro.certifications ?? [],
  }
}
