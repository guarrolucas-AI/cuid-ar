import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/notifications — últimas notificaciones + conteo de no leídas
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'profesional')
      return res.status(403).json({ error: 'Solo para profesionales' })

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { professionalId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { professionalId: req.user.id, read: false },
      }),
    ])
    res.json({ notifications, unread })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/notifications/:id/read — marca una como leída
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const n = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!n || n.professionalId !== req.user.id)
      return res.status(404).json({ error: 'Notificación no encontrada' })
    const updated = await prisma.notification.update({ where: { id: n.id }, data: { read: true } })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/notifications/read-all — marca todas como leídas
router.post('/read-all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'profesional')
      return res.status(403).json({ error: 'Solo para profesionales' })
    await prisma.notification.updateMany({
      where: { professionalId: req.user.id, read: false },
      data: { read: true },
    })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
