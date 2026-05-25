import { Router } from 'express'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { prisma } from '../lib/prisma.js'

const router = Router()

async function getMPToken() {
  const row = await prisma.appConfig.findUnique({ where: { key: 'mp_access_token' } })
  return row?.value || null
}

// POST /api/webhooks/mercadopago
router.post('/mercadopago', async (req, res) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { type, action, data } = body

    // MP envía type='subscription_preapproval' para eventos de suscripción
    const isSubscription = type === 'subscription_preapproval' ||
      action === 'subscription_preapproval'
    if (!isSubscription || !data?.id) return res.sendStatus(200)

    const token = await getMPToken()
    if (!token) return res.sendStatus(200)

    const mp = new MercadoPagoConfig({ accessToken: token })
    const preApproval = new PreApproval(mp)
    const subscription = await preApproval.get({ id: data.id })

    console.log('[WEBHOOK MP] status:', subscription.status, 'email:', subscription.payer_email)

    if (subscription.status === 'authorized') {
      const user = await prisma.user.findFirst({ where: { email: subscription.payer_email } })
      if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { status: 'subscribed' } })
        console.log('[WEBHOOK MP] Usuario suscripto:', user.email)
      }
    }

    // Si se cancela o pausa, desactivar
    if (['cancelled', 'paused'].includes(subscription.status)) {
      const user = await prisma.user.findFirst({ where: { email: subscription.payer_email } })
      if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { status: 'active' } })
        console.log('[WEBHOOK MP] Suscripción desactivada:', user.email)
      }
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('[WEBHOOK MP]', err.message)
    res.sendStatus(500)
  }
})

export default router
