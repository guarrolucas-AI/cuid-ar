import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { uploadProfilePhoto } from '../lib/storage.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

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
    const { available, hourlyRate, name, phone, zone, categories } = req.body
    if (categories !== undefined && (!Array.isArray(categories) || categories.length === 0)) {
      return res.status(400).json({ error: 'Elegí al menos una especialidad' })
    }
    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: {
        ...(available   !== undefined && { available }),
        ...(hourlyRate  !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(name       && { name }),
        ...(phone      && { phone }),
        ...(zone       && { zone }),
        ...(categories && { categories }),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/professional/photo — sube/reemplaza la foto de perfil (store
// público de Vercel Blob, ver server/lib/storage.js). Campo del form:
// "photo".
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Falta el archivo' })
    const url = await uploadProfilePhoto(req.user.id, req.file.buffer, req.file.mimetype)
    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: { photoUrl: url },
    })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
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
