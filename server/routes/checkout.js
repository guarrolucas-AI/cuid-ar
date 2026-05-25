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
        reason: config.mp_reason || 'CUID_AR — Acceso Profesional Mensual',
        payer_email: req.user.email,
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

export default router
