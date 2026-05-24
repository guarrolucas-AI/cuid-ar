import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/match/search?zone=CABA&category=infantil&maxRate=8000
router.get('/search', auth, async (req, res) => {
  try {
    const { zone, category, maxRate } = req.query

    const professionals = await prisma.professional.findMany({
      where: {
        available: true,
        ...(zone && { zone }),
        ...(category && { category }),
        ...(maxRate && { hourlyRate: { lte: parseFloat(maxRate) } }),
      },
      orderBy: { hourlyRate: 'asc' },
      include: { user: { select: { email: true, status: true } } },
    })

    res.json(professionals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/match/notify
router.post('/notify', auth, async (req, res) => {
  try {
    const { professionalId, category } = req.body

    const [professional, parent] = await Promise.all([
      prisma.professional.findUnique({
        where: { userId: professionalId },
        include: { user: true },
      }),
      prisma.parent.findUnique({ where: { userId: req.user.id } }),
    ])

    if (!professional || !parent) {
      return res.status(404).json({ error: 'Datos no encontrados' })
    }

    // Payload listo para conectar con Resend o Twilio en producción
    const notification = {
      to: professional.user.email,
      subject: 'CUID_AR — Nueva búsqueda en tu zona',
      body: `Hola ${professional.name}, una familia en ${parent.address} está buscando un profesional de ${category}. Ingresá a la plataforma para conectarte.`,
    }

    // TODO: await resend.emails.send(notification)
    console.log('[NOTIFY]', notification)

    res.json({ success: true, notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
