import { Router } from 'express'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// Lee la config de MP desde la tabla AppConfig
async function getMPConfig() {
  const rows = await prisma.appConfig.findMany({
    where: { key: { in: ['mp_access_token', 'mp_price_ars', 'mp_reason', 'mp_enabled'] } },
  })
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

// POST /api/checkout/subscribe
router.post('/subscribe', auth, async (req, res) => {
  try {
    const config = await getMPConfig()

    if (config.mp_enabled !== 'true') {
      return res.status(503).json({ error: 'Los pagos aún no están habilitados. Consultá con el administrador.' })
    }
    if (!config.mp_access_token) {
      return res.status(503).json({ error: 'Configuración de pagos incompleta.' })
    }

    const mp = new MercadoPagoConfig({ accessToken: config.mp_access_token })
    const preApproval = new PreApproval(mp)

    const subscription = await preApproval.create({
      body: {
        reason: config.mp_reason || 'CUID_AR — Acceso Mensual',
        payer_email: req.user.email,
        external_reference: req.user.id,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: parseFloat(config.mp_price_ars || '5000'),
          currency_id: 'ARS',
        },
        back_url: 'https://cuid-ar-nine.vercel.app/dashboard?payment=1',
        status: 'pending',
      },
    })

    res.json({ init_point: subscription.init_point, id: subscription.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/checkout/verify — consulta MP y activa la suscripción si está authorized
router.get('/verify', auth, async (req, res) => {
  try {
    const config = await getMPConfig()
    if (!config.mp_access_token) return res.json({ status: req.user.status })

    const mp = new MercadoPagoConfig({ accessToken: config.mp_access_token })
    const preApproval = new PreApproval(mp)

    // Buscar suscripciones vinculadas a este usuario por external_reference
    const search = await preApproval.search({
      options: { external_reference: req.user.id, limit: 5 },
    })

    const authorized = search?.results?.some(s => s.status === 'authorized')

    if (authorized && req.user.status !== 'subscribed') {
      await prisma.user.update({ where: { id: req.user.id }, data: { status: 'subscribed' } })
      return res.json({ status: 'subscribed', updated: true })
    }

    res.json({ status: req.user.status, updated: false })
  } catch (err) {
    console.error('[VERIFY]', err.message)
    res.json({ status: req.user.status, error: err.message })
  }
})

export default router
