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
    const { type, action, data } = req.body || {}

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

    // Buscar usuario por external_reference (ID) o por email como fallback
    const userId = subscription.external_reference
    const findUser = userId
      ? prisma.user.findUnique({ where: { id: userId } })
      : prisma.user.findFirst({ where: { email: subscription.payer_email } })
    const user = await findUser

    if (!user) {
      console.log('[WEBHOOK MP] Usuario no encontrado. external_reference:', userId)
      return res.sendStatus(200)
    }

    if (subscription.status === 'authorized') {
      await prisma.user.update({ where: { id: user.id }, data: { status: 'subscribed' } })
      console.log('[WEBHOOK MP] Usuario suscripto:', user.email)
    }

    if (['cancelled', 'paused'].includes(subscription.status)) {
      await prisma.user.update({ where: { id: user.id }, data: { status: 'active' } })
      console.log('[WEBHOOK MP] Suscripción desactivada:', user.email)
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('[WEBHOOK MP]', err.message)
    res.sendStatus(200) // Siempre 200 para que MP no reintente
  }
})

export default router
