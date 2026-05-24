import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// PATCH /api/professional/me — editar disponibilidad y tarifa
router.patch('/me', auth, async (req, res) => {
  try {
    const { available, hourlyRate } = req.body

    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: {
        ...(available !== undefined && { available }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
      },
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
