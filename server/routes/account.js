import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// PATCH /api/account/password
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
