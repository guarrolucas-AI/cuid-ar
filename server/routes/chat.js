import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { auth } from '../middleware/auth.js'
import { uploadChatAttachment, streamChatAttachment } from '../lib/storage.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
router.use(auth)

// Resuelve la conversación y valida que el usuario logueado sea una de las
// dos partes. Nunca deja pasar a alguien ajeno al hilo.
async function loadConversationForUser(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      professional: { select: { userId: true, name: true, photoUrl: true, category: true } },
      parent: { select: { userId: true, name: true } },
    },
  })
  if (!conversation) return { conversation: null, side: null }
  if (conversation.professionalId === userId) return { conversation, side: 'professional' }
  if (conversation.parentId === userId) return { conversation, side: 'parent' }
  return { conversation: null, side: null }
}

// GET /api/chat/conversations — mis hilos, con último mensaje y estado.
router.get('/conversations', async (req, res) => {
  try {
    const where = req.user.role === 'profesional'
      ? { professionalId: req.user.id }
      : { parentId: req.user.id }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        professional: { select: { userId: true, name: true, photoUrl: true, category: true } },
        parent: { select: { userId: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(conversations.map((c) => ({
      id: c.id,
      category: c.category,
      status: c.status,
      agreedByProfessional: c.agreedByProfessional,
      agreedByParent: c.agreedByParent,
      otherParty: req.user.role === 'profesional'
        ? { userId: c.parent.userId, name: c.parent.name }
        : { userId: c.professional.userId, name: c.professional.name, photoUrl: c.professional.photoUrl },
      lastMessage: c.messages[0] ?? null,
      createdAt: c.createdAt,
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { conversation, side } = await loadConversationForUser(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' })

    const clearedAt = side === 'professional' ? conversation.clearedAtForProfessional : conversation.clearedAtForParent

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id, ...(clearedAt && { createdAt: { gt: clearedAt } }) },
      orderBy: { createdAt: 'asc' },
    })

    res.json({
      conversation: {
        id: conversation.id,
        category: conversation.category,
        status: conversation.status,
        agreedByProfessional: conversation.agreedByProfessional,
        agreedByParent: conversation.agreedByParent,
        myAgreement: side === 'professional' ? conversation.agreedByProfessional : conversation.agreedByParent,
        otherPartyAgreement: side === 'professional' ? conversation.agreedByParent : conversation.agreedByProfessional,
        otherParty: side === 'professional'
          ? { userId: conversation.parent.userId, name: conversation.parent.name }
          : { userId: conversation.professional.userId, name: conversation.professional.name, photoUrl: conversation.professional.photoUrl },
      },
      messages,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/chat/conversations/:id/messages — body: { body: "texto" }
// Solo texto por ahora (sin adjuntos: no hay storage de archivos
// configurado en el proyecto todavía).
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { conversation } = await loadConversationForUser(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' })

    const body = (req.body.body || '').trim()
    if (!body) return res.status(400).json({ error: 'El mensaje no puede estar vacío' })
    if (body.length > 4000) return res.status(400).json({ error: 'Mensaje demasiado largo' })

    const message = await prisma.message.create({
      data: { conversationId: conversation.id, senderId: req.user.id, body },
    })
    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/chat/conversations/:id/attachments — foto o PDF. Campo del
// form: "file". Se guarda en el store PRIVADO de Blob (nunca público) y
// queda como un Message con attachmentPathname; la descarga real pasa
// por GET /api/chat/attachments (ver más abajo), que vuelve a validar
// membership antes de servir el archivo.
router.post('/conversations/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    const { conversation } = await loadConversationForUser(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' })
    if (!req.file) return res.status(400).json({ error: 'Falta el archivo' })

    const attachment = await uploadChatAttachment(conversation.id, req.file.buffer, req.file.mimetype, req.file.originalname)

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user.id,
        body: '',
        attachmentPathname: attachment.pathname,
        attachmentType: attachment.contentType,
        attachmentName: attachment.originalName,
      },
    })
    res.status(201).json(message)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/chat/attachments?pathname=chat/<conversationId>/<archivo>
// Sirve un adjunto privado solo si el usuario logueado pertenece a la
// conversación codificada en el pathname. Nunca se expone la URL directa
// de Blob al cliente.
router.get('/attachments', async (req, res) => {
  try {
    const { pathname } = req.query
    if (!pathname || !pathname.startsWith('chat/')) return res.status(400).json({ error: 'pathname inválido' })

    const conversationId = pathname.split('/')[1]
    const { conversation } = await loadConversationForUser(conversationId, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'No encontrado' })

    const result = await streamChatAttachment(pathname)
    if (!result) return res.status(404).json({ error: 'Archivo no encontrado' })

    res.setHeader('Content-Type', result.blob.contentType)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'private, no-cache')
    const { Readable } = await import('node:stream')
    Readable.fromWeb(result.stream).pipe(res)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/chat/conversations/:id/agree — "Verificar / Cierre de
// Contratación". Cada parte confirma la suya; cuando las dos confirmaron,
// pasa a status "agreed". Idempotente y reversible por si alguien se
// arrepiente antes de que la otra parte confirme.
router.post('/conversations/:id/agree', async (req, res) => {
  try {
    const { conversation, side } = await loadConversationForUser(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' })

    const agree = req.body.agree !== false // default true
    const field = side === 'professional' ? 'agreedByProfessional' : 'agreedByParent'
    const otherField = side === 'professional' ? 'agreedByParent' : 'agreedByProfessional'
    const bothAgree = agree && conversation[otherField]

    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        [field]: agree,
        status: bothAgree ? 'agreed' : 'open',
        agreedAt: bothAgree ? new Date() : null,
      },
    })

    res.json({
      status: updated.status,
      agreedByProfessional: updated.agreedByProfessional,
      agreedByParent: updated.agreedByParent,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/chat/conversations/:id/history — borra SOLO mi vista del
// historial (la otra parte lo sigue viendo). No es un borrado destructivo
// compartido: cada quien decide sobre su propia bandeja.
router.delete('/conversations/:id/history', async (req, res) => {
  try {
    const { conversation, side } = await loadConversationForUser(req.params.id, req.user.id)
    if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' })

    const field = side === 'professional' ? 'clearedAtForProfessional' : 'clearedAtForParent'
    await prisma.conversation.update({ where: { id: conversation.id }, data: { [field]: new Date() } })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
