import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { sendEmail, tpl } from '../lib/email.js'

const router = Router()

const CATEGORY_LABELS = {
  infantil: 'Cuidado Infantil', pedagogico: 'Apoyo Pedagógico',
  salud: 'Salud Pediátrica', terapeutico: 'Cuidado Terapéutico', limpieza: 'Limpieza del Hogar',
}

// GET /api/match/search?zone=CABA&category=infantil&maxRate=8000
router.get('/search', auth, async (req, res) => {
  try {
    const { zone, category, maxRate } = req.query
    const professionals = await prisma.professional.findMany({
      where: {
        available: true,
        verified: true,
        user: { status: 'subscribed' },
        ...(zone     && { zone }),
        ...(category && { category }),
        ...(maxRate  && { hourlyRate: { lte: parseFloat(maxRate) } }),
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
      prisma.professional.findUnique({ where: { userId: professionalId }, include: { user: true } }),
      prisma.parent.findUnique({ where: { userId: req.user.id } }),
    ])

    if (!professional || !parent) return res.status(404).json({ error: 'Datos no encontrados' })
    if (!professional.verified || professional.user.status !== 'subscribed')
      return res.status(403).json({ error: 'Profesional no disponible' })

    await prisma.contactRequest.create({
      data: { professionalId: professional.userId, parentId: parent.userId, category },
    })

    const label = CATEGORY_LABELS[category] ?? category
    const { subject, html } = tpl.notify(professional.name, parent.name, parent.phone, parent.address, label)
    await sendEmail({ to: professional.user.email, subject, html })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
