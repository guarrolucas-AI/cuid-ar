import { Resend } from 'resend'
import { prisma } from './prisma.js'

async function getClient() {
  const row = await prisma.appConfig.findUnique({ where: { key: 'resend_api_key' } })
  if (!row?.value) return null
  return new Resend(row.value)
}

async function getFrom() {
  const row = await prisma.appConfig.findUnique({ where: { key: 'resend_from' } })
  return row?.value || 'CUID_AR <onboarding@resend.dev>'
}

export async function sendEmail({ to, subject, html }) {
  const resend = await getClient()
  if (!resend) {
    console.log('[EMAIL SKIP] Resend no configurado — To:', to, '|', subject)
    return { skipped: true }
  }
  const from = await getFrom()
  return resend.emails.send({ from, to, subject, html })
}

// ── Templates ──────────────────────────────────────────────────────────────
export const tpl = {
  welcome: (name, role) => ({
    subject: 'Bienvenido/a a CUID_AR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#14b8a6">¡Bienvenido/a a CUID_AR, ${name}!</h2>
        <p>Tu cuenta como <strong>${role === 'profesional' ? 'Profesional' : 'Familia'}</strong> fue creada exitosamente.</p>
        ${role === 'profesional'
          ? '<p>Un administrador revisará y verificará tu perfil pronto. Te avisaremos cuando esté aprobado.</p>'
          : '<p>Ya podés buscar profesionales de confianza en tu zona.</p>'}
        <a href="https://cuid-ar-nine.vercel.app/dashboard"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Ir a mi panel
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888">CUID_AR — Buenos Aires, Argentina</p>
      </div>`,
  }),

  notify: (proName, parentName, parentPhone, parentAddress, category) => ({
    subject: 'CUID_AR — Nueva consulta de una familia',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#14b8a6">¡Tenés una nueva consulta!</h2>
        <p>Hola <strong>${proName}</strong>,</p>
        <p>Una familia está buscando un profesional de <strong>${category}</strong>.</p>
        <table style="margin-top:16px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#555;width:120px">Familia</td><td style="padding:8px">${parentName}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#555">Teléfono</td><td style="padding:8px">${parentPhone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Zona</td><td style="padding:8px">${parentAddress}</td></tr>
        </table>
        <a href="https://cuid-ar-nine.vercel.app/dashboard"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Ver en mi panel
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888">CUID_AR — Buenos Aires, Argentina</p>
      </div>`,
  }),

  resetPassword: (resetUrl) => ({
    subject: 'CUID_AR — Restablecer contraseña',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#14b8a6">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>El enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, ignorá este email.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Restablecer contraseña
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888">CUID_AR — Buenos Aires, Argentina</p>
      </div>`,
  }),

  verified: (name) => ({
    subject: 'CUID_AR — Tu perfil fue verificado',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#14b8a6">¡Tu perfil está verificado!</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu perfil profesional fue aprobado. Ahora aparecés en los resultados de búsqueda de las familias.</p>
        <a href="https://cuid-ar-nine.vercel.app/dashboard"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#14b8a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Ver mi panel
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888">CUID_AR — Buenos Aires, Argentina</p>
      </div>`,
  }),
}
