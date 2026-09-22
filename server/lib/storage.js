import { put, get } from '@vercel/blob'

const PERFILES_TOKEN = process.env.PERFILES_READ_WRITE_TOKEN
const CHAT_TOKEN = process.env.CHAT_READ_WRITE_TOKEN

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const MAX_CERT_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ATTACHMENT_TYPES = [...IMAGE_TYPES, 'application/pdf']

const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }

// Foto de perfil de profesional — store público: se muestra a cualquier
// visitante en los resultados de búsqueda, no hay nada que proteger.
// `allowOverwrite` porque cada profesional tiene un único pathname fijo
// (se resube encima si cambia la foto).
export async function uploadProfilePhoto(userId, buffer, mimeType) {
  if (!IMAGE_TYPES.includes(mimeType)) throw new Error('Formato de imagen no soportado (usá JPG, PNG o WEBP)')
  if (buffer.length > MAX_PHOTO_BYTES) throw new Error('La imagen no puede superar 5MB')

  const blob = await put(`perfiles/${userId}.${EXT_BY_MIME[mimeType]}`, buffer, {
    access: 'public',
    token: PERFILES_TOKEN,
    contentType: mimeType,
    allowOverwrite: true,
  })
  return blob.url
}

// Adjunto de chat — store privado: solo se sirve a través de
// /api/chat/attachments/:pathname una vez que la ruta valida que el
// requester es parte de esa conversación (ver server/routes/chat.js).
export async function uploadChatAttachment(conversationId, buffer, mimeType, originalName) {
  if (!ATTACHMENT_TYPES.includes(mimeType)) throw new Error('Formato de archivo no soportado (usá JPG, PNG, WEBP o PDF)')
  if (buffer.length > MAX_ATTACHMENT_BYTES) throw new Error('El archivo no puede superar 10MB')

  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
  const pathname = `chat/${conversationId}/${Date.now()}-${safeName}`

  const blob = await put(pathname, buffer, {
    access: 'private',
    token: CHAT_TOKEN,
    contentType: mimeType,
  })
  return { pathname: blob.pathname, contentType: mimeType, originalName }
}

// Stream-ea un adjunto privado del chat. El caller (la ruta) ya validó
// que el usuario logueado pertenece a esa conversación antes de llamar
// a esto — acá no se repite ese chequeo.
export async function streamChatAttachment(pathname) {
  const result = await get(pathname, { access: 'private', token: CHAT_TOKEN })
  if (result?.statusCode !== 200) return null
  return result
}

// Sube el Certificado de Antecedentes Penales en PDF. Usa el mismo store
// privado que los adjuntos de chat. Solo el admin puede descargarlo vía
// el endpoint /api/admin/certificate/:userId; nunca se expone una URL pública.
export async function uploadCertificate(userId, buffer, mimeType) {
  if (mimeType !== 'application/pdf') throw new Error('Solo se acepta PDF para el certificado de antecedentes')
  if (buffer.length > MAX_CERT_BYTES) throw new Error('El archivo no puede superar 5 MB')

  const blob = await put(`certificates/${userId}.pdf`, buffer, {
    access: 'private',
    token: CHAT_TOKEN,
    contentType: 'application/pdf',
    allowOverwrite: true,
  })
  return blob.pathname
}

// Descarga el certificado para servirlo al admin. El caller ya validó
// que el solicitante tiene rol admin — acá no se repite ese chequeo.
export async function streamCertificate(userId) {
  const pathname = `certificates/${userId}.pdf`
  return get(pathname, { access: 'private', token: CHAT_TOKEN }).catch(() => null)
}
