import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// GET /api/parent/me
router.get('/me', auth, async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({ where: { userId: req.user.id } })
    if (!parent) return res.status(404).json({ error: 'Perfil no encontrado' })
    res.json(parent)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/parent/me
router.patch('/me', auth, async (req, res) => {
  try {
    const { name, phone, address, lat, lng } = req.body
    const updated = await prisma.parent.update({
      where: { userId: req.user.id },
      data: {
        ...(name    && { name }),
        ...(phone   && { phone }),
        ...(address && { address }),
        ...(lat     !== undefined && { lat: lat ? parseFloat(lat) : null }),
        ...(lng     !== undefined && { lng: lng ? parseFloat(lng) : null }),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
