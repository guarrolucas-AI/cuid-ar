import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { fetchCasasParticularesRates } from '../lib/officialRates.js'

const router = Router()

// POST /api/cron/rates — disparado por Vercel Cron el día 3 de cada mes
// a las 12:00 UTC (da tiempo a que ARCA publique el PDF del mes).
// Seguridad: Vercel inyecta automáticamente `Authorization: Bearer <CRON_SECRET>`
// en cada disparo. En local (sin CRON_SECRET en env) el check se omite para
// facilitar pruebas manuales.
router.post('/rates', async (req, res) => {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const bearer = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
    if (bearer !== secret) return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const data = await fetchCasasParticularesRates()
    const source = `ARCA (Casas Particulares) — vigente ${data.vigencia} — cron automático`

    await Promise.all([
      prisma.serviceRate.upsert({
        where:  { category: 'infantil' },
        update: { officialRate: data.infantil, officialRateMonthly: data.infantilMensual, source },
        create: { category: 'infantil', officialRate: data.infantil, officialRateMonthly: data.infantilMensual, source },
      }),
      prisma.serviceRate.upsert({
        where:  { category: 'limpieza' },
        update: { officialRate: data.limpieza, officialRateMonthly: data.limpiezaMensual, source },
        create: { category: 'limpieza', officialRate: data.limpieza, officialRateMonthly: data.limpiezaMensual, source },
      }),
      prisma.adminAuditLog.create({
        data: {
          adminEmail: 'cron@sistema',
          action: 'rates.auto-fetch',
          detail: `${source} — infantil=$${data.infantil}, limpieza=$${data.limpieza}`,
        },
      }),
    ])

    console.log(`[cron/rates] OK — ${source}`)
    res.json({ ok: true, vigencia: data.vigencia, infantil: data.infantil, limpieza: data.limpieza })
  } catch (err) {
    console.error('[cron/rates] Error:', err.message)
    res.status(502).json({ error: err.message })
  }
})

export default router
