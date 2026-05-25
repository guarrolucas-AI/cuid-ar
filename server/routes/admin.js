import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { adminOnly } from '../middleware/adminOnly.js'
import { sendEmail, tpl } from '../lib/email.js'

const router = Router()
router.use(auth, adminOnly)

const DEFAULT_CONFIG = [
  { key: 'mp_enabled',      value: 'false', label: 'Pagos con Mercado Pago activos',    sensitive: false },
  { key: 'mp_access_token', value: '',       label: 'MP Access Token (producción)',      sensitive: true  },
  { key: 'mp_price_ars',    value: '5000',  label: 'Precio suscripción mensual (ARS)',  sensitive: false },
  { key: 'mp_reason',       value: 'CUID_AR — Acceso Profesional Mensual', label: 'Descripción del cobro en MP', sensitive: false },
  { key: 'resend_api_key',  value: '',       label: 'Resend API Key (emails)',           sensitive: true  },
  { key: 'resend_from',     value: '',       label: 'Email remitente (ej: hola@tudominio.com)', sensitive: false },
]

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

    res.json({ updated: results.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
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

    const byCategory = await prisma.professional.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    res.json({
      totalUsers,
      professionals,
      parents,
      verified,
      available,
      byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r._count.category])),
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
        ...(category && { category }),
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

export default router
