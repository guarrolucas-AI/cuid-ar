import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { sendEmail, tpl } from '../lib/email.js'
import { auth } from '../middleware/auth.js'
import { geocodeAddress } from '../lib/geocode.js'

const router = Router()

// Validación de formato DNI (7-8 dígitos) y CUIL (11 dígitos con dígito verificador)
function validateDni(raw) {
  return /^\d{7,8}$/.test((raw ?? '').replace(/\./g, '').trim())
}
function validateCuil(raw) {
  const clean = (raw ?? '').replace(/[-\s.]/g, '').trim()
  if (!/^\d{11}$/.test(clean)) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(clean[i]), 0)
  const rem = sum % 11
  const verifier = rem === 0 ? 0 : rem === 1 ? 9 : 11 - rem
  return parseInt(clean[10]) === verifier
}

const CATEGORIES_REQUIRING_CREDENTIAL = ['salud', 'terapeutico']

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      email, password, role, name, phone, zone, categories, hourlyRate,
      address, travelRadiusKm, maxDistanceKm,
      dni, cuil,
      credentials, // [{ type: 'matricula_nacional'|'matricula_provincial', number, province? }]
      consentimientoAntecedentes,
    } = req.body

    // Consentimiento Ley 25.326 — obligatorio para todos los roles
    if (!consentimientoAntecedentes)
      return res.status(400).json({ error: 'Debés aceptar el tratamiento de datos personales (Ley 25.326) para continuar.' })

    // Validaciones de identidad — obligatorias para todos los roles
    if (!dni || !validateDni(dni)) return res.status(400).json({ error: 'DNI inválido. Ingresá 7 u 8 dígitos sin puntos.' })
    if (!cuil || !validateCuil(cuil)) return res.status(400).json({ error: 'CUIL inválido. Verificá el formato XX-XXXXXXXX-X.' })

    if (role === 'profesional' && (!Array.isArray(categories) || categories.length === 0)) {
      return res.status(400).json({ error: 'Elegí al menos una especialidad' })
    }

    // Matrícula obligatoria para salud y terapéutico
    const needsCredential = role === 'profesional' &&
      (categories ?? []).some((c) => CATEGORIES_REQUIRING_CREDENTIAL.includes(c))
    if (needsCredential) {
      if (!Array.isArray(credentials) || credentials.length === 0)
        return res.status(400).json({ error: 'Enfermería y Acompañante Terapéutico requieren al menos una matrícula (nacional o provincial).' })
      for (const c of credentials) {
        if (!c.type || !c.number?.trim())
          return res.status(400).json({ error: 'Completá el tipo y número de cada matrícula.' })
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'El email ya está registrado' })

    const hashed = await bcrypt.hash(password, 10)
    const dniClean  = dni.replace(/\./g, '').trim()
    const cuilClean = cuil.replace(/[-\s.]/g, '').trim()

    // El backend calcula lat/lng a partir de la dirección cargada — nunca
    // se confía en coordenadas que mande el cliente.
    const coords = address ? await geocodeAddress(address) : null

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        dni:  dniClean,
        cuil: cuilClean,
        consentimientoAntecedentes: true,
        fechaConsentimiento: new Date(),
        ipRegistro: req.ip ?? req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? null,
        identityCheck: { create: { status: 'pending' } },
        ...(role === 'profesional' && {
          professional: {
            create: {
              name, phone, zone, categories, hourlyRate: parseFloat(hourlyRate),
              address: address || null,
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
              travelRadiusKm: travelRadiusKm ? parseFloat(travelRadiusKm) : 15,
              ...(needsCredential && credentials?.length > 0 && {
                credentials: {
                  create: credentials.map(({ type, number, province }) => ({
                    type,
                    number: number.trim(),
                    province: province?.trim() || null,
                  })),
                },
              }),
            },
          },
        }),
        ...(role === 'padre' && {
          parent: {
            create: {
              name, phone, address,
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
              maxDistanceKm: maxDistanceKm ? parseFloat(maxDistanceKm) : 15,
            },
          },
        }),
      },
      include: { professional: { include: { credentials: true } }, parent: true },
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

    const frontendUrl = process.env.FRONTEND_URL || 'https://www.cuidar360.com.ar'
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
