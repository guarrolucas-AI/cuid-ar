import { Router } from 'express'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { auth } from '../middleware/auth.js'

const router = Router()

// POST /api/checkout/subscribe
router.post('/subscribe', auth, async (req, res) => {
  try {
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const preApproval = new PreApproval(mp)

    const subscription = await preApproval.create({
      body: {
        reason: 'CUID_AR — Acceso Profesional Mensual',
        payer_email: req.user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 5000,
          currency_id: 'ARS',
        },
        back_url: `${process.env.FRONTEND_URL}/dashboard`,
        status: 'pending',
      },
    })

    res.json({ init_point: subscription.init_point, id: subscription.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
