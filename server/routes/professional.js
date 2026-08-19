import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/professional/me
router.get('/me', auth, async (req, res) => {
  try {
    const pro = await prisma.professional.findUnique({ where: { userId: req.user.id } })
    if (!pro) return res.status(404).json({ error: 'Perfil no encontrado' })
    res.json(pro)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/professional/me
router.patch('/me', auth, async (req, res) => {
  try {
    const { available, hourlyRate, name, phone, zone, category } = req.body
    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: {
        ...(available  !== undefined && { available }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(name     && { name }),
        ...(phone    && { phone }),
        ...(zone     && { zone }),
        ...(category && { category }),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/professional/notifications
// La dirección y el teléfono del solicitante nunca se exponen acá (ni en
// ningún endpoint público): son datos restringidos al uso interno del
// sistema (cálculo de distancia) y al backoffice del admin. El contacto
// real pasa por el chat interno — se devuelve el conversationId de cada
// solicitud para que el frontend linkee directo a esa conversación.
router.get('/notifications', auth, async (req, res) => {
  try {
    const [requests, conversations] = await Promise.all([
      prisma.contactRequest.findMany({
        where: { professionalId: req.user.id },
        include: { parent: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.conversation.findMany({
        where: { professionalId: req.user.id },
        select: { id: true, parentId: true },
      }),
    ])
    const conversationByParent = Object.fromEntries(conversations.map((c) => [c.parentId, c.id]))
    res.json(requests.map((r) => ({
      id: r.id,
      category: r.category,
      createdAt: r.createdAt,
      parent: { name: r.parent.name },
      conversationId: conversationByParent[r.parentId] ?? null,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
