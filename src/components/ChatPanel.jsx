import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Send, X, CheckCircle2, Circle, Trash2, ShieldCheck } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const CAT_LABELS = { infantil:'Cuidado Infantil', pedagogico:'Apoyo Pedagógico', salud:'Salud Pediátrica', terapeutico:'Cuidado Terapéutico', limpieza:'Limpieza del Hogar' }

// Chat por "polling" (sin WebSockets, por las limitaciones de funciones
// serverless en Vercel): refresca la lista cada 8s y una conversación
// abierta cada 4s. Queda documentado en la memoria del proyecto el camino
// para migrar a Pusher Channels (tiempo real de verdad) el día que se
// cree esa cuenta.
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <h3 className="font-heading font-bold text-gray-800 px-6 pt-6 mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-teal-500" />
        Mensajes
        {conversations.length > 0 && (
          <span className="ml-1 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{conversations.length}</span>
        )}
      </h3>

      {activeId ? (
        <ConversationThread id={activeId} userId={userId} onBack={() => setActiveId(null)} onChanged={loadConversations} />
      ) : (
        <div className="px-6 pb-6">
          {loading ? (
            <p className="text-sm text-gray-400 py-4">Cargando…</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">Todavía no tenés conversaciones.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map(c => (
                <button key={c.id} onClick={() => setActiveId(c.id)}
                  className="w-full text-left border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:bg-teal-50/40 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{c.otherParty.name}</span>
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{CAT_LABELS[c.category] ?? c.category}</span>
                      {c.status === 'agreed' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="w-3 h-3"/>Contratación cerrada</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1 max-w-xs">
                      {c.lastMessage ? c.lastMessage.body : 'Todavía no hay mensajes'}
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

function ConversationThread({ id, userId, onBack, onChanged }) {
  const [data, setData] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

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
    } catch { /* el próximo poll retoma el estado real */ }
    setSending(false)
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

  if (!data) return <div className="px-6 pb-6"><p className="text-sm text-gray-400 py-4">Cargando…</p></div>

  const { conversation, messages } = data

  return (
    <div className="flex flex-col" style={{ height: 480 }}>
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm text-teal-600 font-semibold flex items-center gap-1">
          <X className="w-4 h-4"/> Volver
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">{conversation.otherParty.name}</p>
          <p className="text-xs text-gray-400">{CAT_LABELS[conversation.category] ?? conversation.category}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 bg-gray-50/50">
        {messages.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Todavía no hay mensajes. ¡Escribí el primero!</p>}
        {messages.map(m => {
          const mine = m.senderId === userId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-teal-500 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                {m.body}
                <div className={`text-[10px] mt-1 ${mine ? 'text-teal-100' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-white space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
          <button onClick={toggleAgree}
            className={`flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-full transition-colors ${
              conversation.myAgreement ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {conversation.myAgreement ? <CheckCircle2 className="w-3.5 h-3.5"/> : <Circle className="w-3.5 h-3.5"/>}
            {conversation.myAgreement ? 'Contratación confirmada por vos' : 'Confirmar cierre de contratación'}
          </button>
          <button onClick={clearHistory} className="flex items-center gap-1 text-gray-400 hover:text-red-500">
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
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribí un mensaje…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"/>
          <button type="submit" disabled={sending || !text.trim()}
            className="flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 flex-shrink-0">
            <Send className="w-4 h-4"/>
          </button>
        </form>
      </div>
    </div>
  )
}
