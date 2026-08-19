import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Token requerido' })

    const { userId } = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' })

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Igual que `auth`, pero no bloquea si no hay token: deja req.user en null
// para rutas públicas que además quieren dar más datos si hay sesión activa
// (ej. la búsqueda de profesionales, visible para visitantes sin cuenta).
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) { req.user = null; return next() }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await prisma.user.findUnique({ where: { id: userId } })
  } catch {
    req.user = null
  }
  next()
}
