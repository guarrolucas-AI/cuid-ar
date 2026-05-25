import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { sendEmail, tpl } from '../lib/email.js'

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
    const profile = user.professional ?? user.parent ?? null

    // Email de bienvenida (no bloqueante)
    const profileName = profile?.name ?? email
    const { subject, html } = tpl.welcome(profileName, role)
    sendEmail({ to: email, subject, html }).catch(console.error)

    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, status: user.status }, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
      include: { professional: true, parent: true },
    })
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    const profile = user.professional ?? user.parent ?? null
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, status: user.status }, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me — devuelve usuario y perfil actualizados
import { auth } from '../middleware/auth.js'
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { professional: true, parent: true },
    })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    const profile = user.professional ?? user.parent ?? null
    res.json({ user: { id: user.id, email: user.email, role: user.role, status: user.status }, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    // Siempre responde 200 para no revelar si el email existe
    if (!user) return res.json({ ok: true })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } })

    const frontendUrl = process.env.FRONTEND_URL || 'https://cuid-ar-nine.vercel.app'
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`
    const { subject, html } = tpl.resetPassword(resetUrl)
    await sendEmail({ to: email, subject, html })

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Datos inválidos' })

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.used || record.expiresAt < new Date())
      return res.status(400).json({ error: 'El enlace es inválido o expiró' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await Promise.all([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
    ])

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
