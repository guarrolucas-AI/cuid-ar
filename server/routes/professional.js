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

export default router
