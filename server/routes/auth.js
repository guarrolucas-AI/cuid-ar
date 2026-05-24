import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, zone, category, hourlyRate, address, lat, lng } = req.body

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'El email ya está registrado' })

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        ...(role === 'profesional' && {
          professional: {
            create: { name, phone, zone, category, hourlyRate: parseFloat(hourlyRate) },
          },
        }),
        ...(role === 'padre' && {
          parent: {
            create: { name, phone, address, lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null },
          },
        }),
      },
      include: { professional: true, parent: true },
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, status: user.status } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
