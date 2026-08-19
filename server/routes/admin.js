import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { adminOnly } from '../middleware/adminOnly.js'
import { sendEmail, tpl } from '../lib/email.js'
import { fetchCasasParticularesRates } from '../lib/officialRates.js'

const router = Router()
router.use(auth, adminOnly)

const DEFAULT_CONFIG = [
  { key: 'mp_enabled',      value: 'false', label: 'Pagos con Mercado Pago activos',    sensitive: false },
  { key: 'mp_access_token', value: '',       label: 'MP Access Token (producción)',      sensitive: true  },
  { key: 'mp_price_ars',    value: '5000',  label: 'Precio suscripción mensual (ARS)',  sensitive: false },
  { key: 'mp_reason',       value: 'CUID_AR — Acceso Profesional Mensual', label: 'Descripción del cobro en MP', sensitive: false },
  { key: 'resend_api_key',  value: '',       label: 'Resend API Key (emails)',           sensitive: true  },
  { key: 'resend_from',     value: '',       label: 'Email remitente (ej: hola@tudominio.com)', sensitive: false },
  { key: 'rate_tolerance_ars', value: '5000', label: 'Tolerancia sobre la tarifa oficial ($, ±)', sensitive: false },
]

const RATE_CATEGORIES = ['infantil', 'pedagogico', 'salud', 'terapeutico', 'limpieza']

// Registra una acción del admin para trazabilidad — nunca bloquea la
// respuesta principal si falla (no queremos que un problema de logging
// tumbe una verificación real).
async function logAudit(req, action, { targetType, targetId, detail } = {}) {
  try {
    await prisma.adminAuditLog.create({
      data: { adminEmail: req.user.email, action, targetType, targetId, detail },
    })
  } catch (err) {
    console.error('audit log failed:', err)
  }
}

// GET /api/admin/config — devuelve config, enmascara campos sensibles
router.get('/config', async (req, res) => {
  try {
    // Inicializa defaults si la tabla está vacía
    for (const item of DEFAULT_CONFIG) {
      await prisma.appConfig.upsert({
        where: { key: item.key },
        update: {},
        create: item,
      })
    }

    const configs = await prisma.appConfig.findMany({ orderBy: { key: 'asc' } })

    const safe = configs.map((c) => ({
      ...c,
      value: c.sensitive && c.value ? '••••••••' : c.value,
    }))

    res.json(safe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/config — actualiza uno o varios keys a la vez
// body: { mp_access_token: "APP_USR-xxx", mp_price_ars: "6000", ... }
router.patch('/config', async (req, res) => {
  try {
    const updates = Object.entries(req.body)

    const results = await Promise.all(
      updates.map(([key, value]) =>
        prisma.appConfig.update({
          where: { key },
          data: { value: String(value) },
        })
      )
    )

    await logAudit(req, 'config.update', { detail: updates.map(([k]) => k).join(', ') })
    res.json({ updated: results.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/rates — tarifas de referencia oficiales por categoría
router.get('/rates', async (req, res) => {
  try {
    for (const category of RATE_CATEGORIES) {
      await prisma.serviceRate.upsert({
        where: { category },
        update: {},
        create: { category, officialRate: null },
      })
    }
    const rates = await prisma.serviceRate.findMany({ orderBy: { category: 'asc' } })
    res.json(rates)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/rates — actualiza una o varias tarifas oficiales a la vez
// body: { infantil: 6000, limpieza: 5300, ... }
router.patch('/rates', async (req, res) => {
  try {
    const updates = Object.entries(req.body).filter(([category]) => RATE_CATEGORIES.includes(category))
    const results = await Promise.all(
      updates.map(([category, officialRate]) => {
        const rate = officialRate === '' || officialRate == null ? null : parseFloat(officialRate)
        return prisma.serviceRate.upsert({
          where: { category },
          update: { officialRate: rate, source: rate == null ? null : 'Manual' },
          create: { category, officialRate: rate, source: rate == null ? null : 'Manual' },
        })
      })
    )
    await logAudit(req, 'rates.update', { detail: updates.map(([cat, rate]) => `${cat}=${rate}`).join(', ') })
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/rates/fetch-official — trae automáticamente la escala
// vigente de Personal de Casas Particulares (fuente: ARCA/ex AFIP) y
// actualiza infantil/limpieza, las dos únicas categorías cubiertas por
// ese régimen. El admin puede sobreescribir cualquiera de los dos a mano
// después con el formulario de arriba (eso vuelve a marcarlo "Manual").
router.post('/rates/fetch-official', async (req, res) => {
  try {
    const data = await fetchCasasParticularesRates()
    const source = `ARCA (Casas Particulares) — vigente ${data.vigencia}`
    const [infantil, limpieza] = await Promise.all([
      prisma.serviceRate.upsert({
        where: { category: 'infantil' },
        update: { officialRate: data.infantil, source },
        create: { category: 'infantil', officialRate: data.infantil, source },
      }),
      prisma.serviceRate.upsert({
        where: { category: 'limpieza' },
        update: { officialRate: data.limpieza, source },
        create: { category: 'limpieza', officialRate: data.limpieza, source },
      }),
    ])
    await logAudit(req, 'rates.fetch-official', { detail: `${source} — infantil=${data.infantil}, limpieza=${data.limpieza}` })
    res.json({ infantil, limpieza, vigencia: data.vigencia, sourceUrl: data.sourceUrl })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// GET /api/admin/stats — métricas rápidas del panel
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, professionals, parents, verified, available] = await Promise.all([
      prisma.user.count(),
      prisma.professional.count(),
      prisma.parent.count(),
      prisma.professional.count({ where: { verified: true } }),
      prisma.professional.count({ where: { available: true } }),
    ])

    // groupBy no sirve para contar por elemento de un array — un
    // profesional con 2 categorías cuenta en las 2. unnest() lo resuelve,
    // pero Postgres no permite mezclar una set-returning function con
    // GROUP BY en el mismo nivel de SELECT — de ahí la subquery.
    const byCategoryRows = await prisma.$queryRaw`
      SELECT category, count(*)::int AS count
      FROM (SELECT unnest("categories") AS category FROM "Professional") sub
      GROUP BY category
    `

    res.json({
      totalUsers,
      professionals,
      parents,
      verified,
      available,
      byCategory: Object.fromEntries(byCategoryRows.map((r) => [r.category, r.count])),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/professionals?category=&zone=&verified=
router.get('/professionals', async (req, res) => {
  try {
    const { category, zone, verified } = req.query
    const professionals = await prisma.professional.findMany({
      where: {
        ...(category && { categories: { has: category } }),
        ...(zone     && { zone }),
        ...(verified !== undefined && verified !== '' && { verified: verified === 'true' }),
      },
      include: { user: { select: { email: true, status: true, createdAt: true } } },
      orderBy: { user: { createdAt: 'desc' } },
    })
    res.json(professionals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/verify/:userId
router.post('/verify/:userId', async (req, res) => {
  try {
    const { verified } = req.body
    const updated = await prisma.professional.update({
      where: { userId: req.params.userId },
      data: { verified: Boolean(verified) },
      include: { user: true },
    })
    // Notifica al profesional si acaba de ser verificado
    if (verified) {
      const { subject, html } = tpl.verified(updated.name)
      sendEmail({ to: updated.user.email, subject, html }).catch(console.error)
    }
    await logAudit(req, verified ? 'professional.verify' : 'professional.unverify', {
      targetType: 'Professional', targetId: updated.userId, detail: updated.name,
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/subscription/:userId — activa o desactiva suscripción manualmente
router.post('/subscription/:userId', async (req, res) => {
  try {
    const { active } = req.body
    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { status: active ? 'subscribed' : 'active' },
    })
    await logAudit(req, active ? 'subscription.activate' : 'subscription.deactivate', {
      targetType: 'User', targetId: updated.id, detail: updated.email,
    })
    res.json({ userId: updated.id, status: updated.status })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/parents
router.get('/parents', async (req, res) => {
  try {
    const parents = await prisma.parent.findMany({
      include: { user: { select: { email: true, status: true, createdAt: true } } },
      orderBy: { user: { createdAt: 'desc' } },
    })
    res.json(parents)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/audit — últimas acciones del backoffice (auditoría)
router.get('/audit', async (req, res) => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
