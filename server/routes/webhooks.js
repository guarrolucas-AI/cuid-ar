import { Router } from 'express'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { prisma } from '../lib/prisma.js'

const router = Router()

// POST /api/webhooks/mercadopago
router.post('/mercadopago', async (req, res) => {
  try {
    const { action, data } = req.body

    // Solo procesamos eventos de suscripción autorizada
    if (action !== 'subscription_preapproval') return res.sendStatus(200)

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const preApproval = new PreApproval(mp)
    const subscription = await preApproval.get({ id: data.id })

    if (subscription.status === 'authorized') {
      const user = await prisma.user.findFirst({
        where: { email: subscription.payer_email },
      })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'subscribed' },
        })
      }
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('[WEBHOOK MP]', err.message)
    res.sendStatus(500)
  }
})

export default router
