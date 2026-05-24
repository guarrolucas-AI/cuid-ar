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
