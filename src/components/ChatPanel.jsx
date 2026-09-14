import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Send, X, CheckCircle2, Circle, Trash2, ShieldCheck, Paperclip, FileText, Download, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const CAT_LABELS = { infantil:'Cuidado Infantil', pedagogico:'Apoyo Pedagógico', salud:'Salud Pediátrica', terapeutico:'Cuidado Terapéutico', limpieza:'Limpieza del Hogar' }

export default function ChatPanel({ userId, openConversationId, onOpened }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(openConversationId ?? null)

  const loadConversations = useCallback(() => {
    fetch(`${API_BASE}/api/chat/conversations`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setConversations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadConversations()
    const id = setInterval(loadConversations, 8000)
    return () => clearInterval(id)
  }, [loadConversations])

  useEffect(() => {
    if (openConversationId) { setActiveId(openConversationId); onOpened?.() }
  }, [openConversationId, onOpened])

  return (
    <div className="border overflow-hidden" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold px-6 pt-6 mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <MessageCircle className="w-4 h-4" style={{ color: 'var(--cuidar-verde-institucional)' }} />
        Mensajes
        {conversations.length > 0 && (
          <span className="ml-1 text-white text-xs font-bold px-2 py-0.5"
            style={{ background: 'var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
            {conversations.length}
          </span>
        )}
      </h3>

      {activeId ? (
        <ConversationThread id={activeId} userId={userId} onBack={() => setActiveId(null)} onChanged={loadConversations} />
      ) : (
        <div className="px-6 pb-6">
          {loading ? (
            <p className="text-sm py-4" style={{ color: 'var(--cuidar-gris-suave)' }}>Cargando…</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm py-4" style={{ color: 'var(--cuidar-gris-suave)' }}>Todavía no tenés conversaciones.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map(c => (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className="w-full text-left border p-4 transition-colors flex items-center justify-between gap-3"
                  style={{ borderColor: 'var(--cuidar-borde)', background: '#FFFFFF' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'; e.currentTarget.style.background = 'var(--cuidar-nieve)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cuidar-borde)'; e.currentTarget.style.background = '#FFFFFF' }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>{c.otherParty.name}</span>
                      <span className="text-xs px-2 py-0.5 font-medium"
                        style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
                        {CAT_LABELS[c.category] ?? c.category}
                      </span>
                      {c.status === 'agreed' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="w-3 h-3"/>Contratación cerrada</span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-1 max-w-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>
                      {!c.lastMessage
                        ? 'Todavía no hay mensajes'
                        : c.lastMessage.body || (c.lastMessage.attachmentPathname ? '📎 Adjunto' : '')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'

function Attachment({ m, mine }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [error, setError] = useState(false)
  const isImage = m.attachmentType?.startsWith('image/')

  useEffect(() => {
    let revoke = null
    let cancelled = false
    fetch(`${API_BASE}/api/chat/attachments?pathname=${encodeURIComponent(m.attachmentPathname)}`, { headers: authHeaders() })
      .then(res => { if (!res.ok) throw new Error(); return res.blob() })
      .then(blob => {
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        revoke = url
        setBlobUrl(url)
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true; if (revoke) URL.revokeObjectURL(revoke) }
  }, [m.attachmentPathname])

  if (error) return <p className="text-xs italic opacity-70">No se pudo cargar el adjunto</p>
  if (!blobUrl) return <div className="w-40 h-28 bg-black/10 animate-pulse" />

  if (isImage) {
    return (
      <a href={blobUrl} target="_blank" rel="noreferrer">
        <img src={blobUrl} alt={m.attachmentName ?? 'adjunto'} className="max-w-[220px] max-h-[220px] object-cover" />
      </a>
    )
  }

  return (
    <a href={blobUrl} download={m.attachmentName ?? 'archivo.pdf'}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-medium ${mine ? 'bg-white/15 text-white' : 'text-gray-700 border'}`}
      style={!mine ? { background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)' } : {}}>
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="truncate max-w-[140px]">{m.attachmentName ?? 'archivo.pdf'}</span>
      <Download className="w-3.5 h-3.5 flex-shrink-0" />
    </a>
  )
}

function ConversationThread({ id, userId, onBack, onChanged }) {
  const [data, setData] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const load = useCallback(() => {
    fetch(`${API_BASE}/api/chat/conversations/${id}/messages`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [id])

  useEffect(() => {
    load()
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' })
  }, [data?.messages?.length])

  const send = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setSending(true)
    try {
      await fetch(`${API_BASE}/api/chat/conversations/${id}/messages`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ body }),
      })
      setText('')
      load()
      onChanged?.()
    } catch {}
    setSending(false)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_ATTACHMENT_BYTES) { alert('El archivo no puede superar 10MB'); return }
    setUploadingFile(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/api/chat/conversations/${id}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      })
      if (!res.ok) throw new Error((await res.json()).error)
      load()
      onChanged?.()
    } catch (err) { alert(err.message) }
    setUploadingFile(false)
  }

  const toggleAgree = async () => {
    const nextAgree = !data.conversation.myAgreement
    await fetch(`${API_BASE}/api/chat/conversations/${id}/agree`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ agree: nextAgree }),
    })
    load()
    onChanged?.()
  }

  const clearHistory = async () => {
    if (!confirm('¿Borrar tu historial de esta conversación? La otra persona lo va a seguir viendo.')) return
    await fetch(`${API_BASE}/api/chat/conversations/${id}/history`, { method: 'DELETE', headers: authHeaders() })
    load()
  }

  if (!data) return <div className="px-6 pb-6"><p className="text-sm py-4" style={{ color: 'var(--cuidar-gris-suave)' }}>Cargando…</p></div>

  const { conversation, messages } = data

  return (
    <div className="flex flex-col" style={{ height: 480 }}>
      <div className="px-6 py-3 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--cuidar-borde)' }}>
        <button onClick={onBack} className="text-sm font-semibold flex items-center gap-1 transition-colors"
          style={{ color: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
          <X className="w-4 h-4"/> Volver
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold" style={{ color: 'var(--cuidar-tinta)' }}>{conversation.otherParty.name}</p>
          <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{CAT_LABELS[conversation.category] ?? conversation.category}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2" style={{ background: 'var(--cuidar-nieve)' }}>
        {messages.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--cuidar-gris-suave)' }}>Todavía no hay mensajes. ¡Escribí el primero!</p>
        )}
        {messages.map(m => {
          const mine = m.senderId === userId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-4 py-2 text-sm"
                style={mine
                  ? { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }
                  : { background: '#FFFFFF', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}>
                {m.attachmentPathname && <Attachment m={m} mine={mine} />}
                {m.body && <p className={m.attachmentPathname ? 'mt-1' : ''}>{m.body}</p>}
                <div className="text-[10px] mt-1" style={{ color: mine ? 'rgba(246,248,246,0.65)' : 'var(--cuidar-gris-suave)' }}>
                  {new Date(m.createdAt).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-3 space-y-2" style={{ borderTop: '1px solid var(--cuidar-borde)', background: '#FFFFFF' }}>
        <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
          <button onClick={toggleAgree}
            className="flex items-center gap-1.5 font-semibold px-3 py-1.5 transition-colors"
            style={conversation.myAgreement
              ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }
              : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
            {conversation.myAgreement ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Circle className="w-3.5 h-3.5"/>}
            {conversation.myAgreement ? 'Contratación confirmada por vos' : 'Confirmar cierre de contratación'}
          </button>
          <button onClick={clearHistory} className="flex items-center gap-1 transition-colors"
            style={{ color: 'var(--cuidar-gris-suave)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
            <Trash2 className="w-3.5 h-3.5"/> Borrar historial
          </button>
        </div>
        {conversation.status === 'agreed' && (
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/>Ambas partes confirmaron el cierre de la contratación.</p>
        )}
        {conversation.myAgreement && conversation.status !== 'agreed' && (
          <p className="text-xs text-amber-500">Esperando la confirmación de la otra parte.</p>
        )}
        <form onSubmit={send} className="flex gap-2">
          <input ref={fileInputRef} type="file" accept={ATTACHMENT_ACCEPT} className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
            className="flex items-center justify-center w-10 h-10 disabled:opacity-50 flex-shrink-0 transition-colors"
            style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-gris-suave)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'; e.currentTarget.style.color = 'var(--cuidar-verde-institucional)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cuidar-borde)'; e.currentTarget.style.color = 'var(--cuidar-gris-suave)' }}
            title="Adjuntar foto o PDF">
            {uploadingFile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </button>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribí un mensaje…"
            className="flex-1 px-4 py-2.5 text-sm outline-none"
            style={{ border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}/>
          <button type="submit" disabled={sending || !text.trim()}
            className="flex items-center justify-center w-10 h-10 disabled:opacity-50 flex-shrink-0 text-white"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
            <Send className="w-4 h-4"/>
          </button>
        </form>
      </div>
    </div>
  )
}
