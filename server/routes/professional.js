import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { uploadProfilePhoto, uploadCertificate } from '../lib/storage.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// GET /api/professional/me — incluye credentials (con número, solo para el propio usuario)
router.get('/me', auth, async (req, res) => {
  try {
    const pro = await prisma.professional.findUnique({
      where: { userId: req.user.id },
      include: { credentials: { orderBy: { createdAt: 'asc' } } },
    })
    if (!pro) return res.status(404).json({ error: 'Perfil no encontrado' })
    res.json(pro)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/professional/me
router.patch('/me', auth, async (req, res) => {
  try {
    const { available, hourlyRate, name, phone, zone, categories, bio } = req.body
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
        ...(bio        !== undefined && { bio: bio || null }),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/professional/credentials — reemplaza las matrículas del profesional
// (solo para categorías que las requieren; la verificación la hace el admin)
router.put('/credentials', auth, async (req, res) => {
  try {
    const { credentials } = req.body // [{ type, number, province? }]
    if (!Array.isArray(credentials) || credentials.length === 0)
      return res.status(400).json({ error: 'Ingresá al menos una matrícula' })
    for (const c of credentials) {
      if (!c.type || !c.number?.trim())
        return res.status(400).json({ error: 'Completá tipo y número de cada matrícula' })
    }
    // Borra las anteriores y recrea — más simple que un diff de N credenciales
    await prisma.professionalCredential.deleteMany({ where: { professionalId: req.user.id } })
    await prisma.professionalCredential.createMany({
      data: credentials.map(({ type, number, province }) => ({
        professionalId: req.user.id,
        type,
        number: number.trim(),
        province: province?.trim() || null,
      })),
    })
    const updated = await prisma.professionalCredential.findMany({
      where: { professionalId: req.user.id },
      orderBy: { createdAt: 'asc' },
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

// PATCH /api/professional/duty — activa/desactiva el modo "De Guardia"
router.patch('/duty', auth, async (req, res) => {
  try {
    const { onDuty } = req.body
    const updated = await prisma.professional.update({
      where: { userId: req.user.id },
      data: { onDuty: Boolean(onDuty) },
    })
    res.json({ onDuty: updated.onDuty })
  } catch (err) {
    res.status(500).json({ error: err.message })
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

// GET /api/professional/alert-config
router.get('/alert-config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'profesional')
      return res.status(403).json({ error: 'Solo para profesionales' })
    const config = await prisma.professionalAlertConfig.findUnique({
      where: { professionalId: req.user.id },
    })
    res.json(config ?? { zones: [], categories: [], active: false })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/professional/alert-config
router.patch('/alert-config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'profesional')
      return res.status(403).json({ error: 'Solo para profesionales' })
    const { zones, categories, active } = req.body
    const config = await prisma.professionalAlertConfig.upsert({
      where: { professionalId: req.user.id },
      create: {
        professionalId: req.user.id,
        zones:      Array.isArray(zones)      ? zones      : [],
        categories: Array.isArray(categories) ? categories : [],
        active:     active !== false,
      },
      update: {
        ...(zones      !== undefined && { zones }),
        ...(categories !== undefined && { categories }),
        ...(active     !== undefined && { active }),
      },
    })
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/professional/identity-status — estado de verificación de identidad
// del usuario autenticado. Incluye días restantes para el vencimiento y si
// la cuenta está suspendida por documentación.
router.get('/identity-status', auth, async (req, res) => {
  try {
    const SUSPENSION_DAYS = 5
    const [check, user] = await Promise.all([
      prisma.identityCheck.findUnique({
        where: { userId: req.user.id },
        select: { status: true, certificadoUrl: true, notes: true },
      }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { subscribedAt: true, status: true },
      }),
    ])

    const isSuspended = user?.status === 'suspended_docs'
    const identityStatus = check?.status ?? 'pending'
    let daysRemaining = null
    if (user?.subscribedAt && !isSuspended && identityStatus !== 'clear') {
      const elapsed = (Date.now() - new Date(user.subscribedAt).getTime()) / (1000 * 60 * 60 * 24)
      daysRemaining = Math.max(0, Math.ceil(SUSPENSION_DAYS - elapsed))
    }

    if (!check) return res.json({ status: 'pending', hasCertificado: false, notes: null, daysRemaining, isSuspended })
    res.json({
      status: identityStatus,
      hasCertificado: !!check.certificadoUrl,
      notes: identityStatus === 'flagged' ? check.notes : null,
      daysRemaining,
      isSuspended,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/professional/certificate — sube o reemplaza el PDF del
// Certificado de Antecedentes Penales. Solo PDF, máx 5 MB.
// El path se guarda en IdentityCheck.certificadoUrl y el status pasa a
// 'manual_review' si estaba en 'pending' o 'flagged' (para que el admin
// lo revise de nuevo cuando se reenvía).
router.post('/certificate', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Falta el archivo PDF' })
    if (req.file.mimetype !== 'application/pdf')
      return res.status(400).json({ error: 'Solo se acepta PDF' })

    const pathname = await uploadCertificate(req.user.id, req.file.buffer, req.file.mimetype)

    const existing = await prisma.identityCheck.findUnique({ where: { userId: req.user.id } })
    const nextStatus = existing && existing.status === 'clear' ? 'clear' : 'manual_review'

    await prisma.identityCheck.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, status: 'manual_review', certificadoUrl: pathname },
      update: { certificadoUrl: pathname, status: nextStatus },
    })

    res.json({ ok: true, status: nextStatus })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
