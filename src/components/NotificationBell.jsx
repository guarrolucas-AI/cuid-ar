import { useState, useEffect, useRef } from 'react'
import { Bell, BellRing, Briefcase, CheckCheck, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function NotificationBell({ onViewJob }) {
  const [open, setOpen]            = useState(false)
  const [notifications, setNotifs] = useState([])
  const [unread, setUnread]        = useState(0)
  const ref                        = useRef(null)

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, { headers: authH() })
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.notifications ?? [])
      setUnread(data.unread ?? 0)
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'POST', headers: authH() })
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PATCH', headers: authH() })
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(v => !v); load() }}
        className="relative p-2.5 transition-colors"
        style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
        title="Notificaciones">
        {unread > 0
          ? <BellRing className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
          : <Bell className="w-5 h-5" style={{ color: 'var(--cuidar-gris-suave)' }} />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-bold flex items-center justify-center leading-none"
            style={{ background: 'var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 border z-50 overflow-hidden"
          style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--cuidar-borde)' }}>
            <span className="font-heading font-bold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>Notificaciones</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
                  <CheckCheck className="w-3.5 h-3.5" /> Todo leído
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1"
                style={{ color: 'var(--cuidar-gris-suave)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--cuidar-nieve)' }}>
            {notifications.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--cuidar-gris-suave)' }}>
                No hay notificaciones todavía.
              </p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4"
                  style={{ background: !n.read ? 'var(--cuidar-nieve)' : '#FFFFFF' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ background: !n.read ? 'var(--cuidar-nieve)' : 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                      <Briefcase className="w-4 h-4" style={{ color: !n.read ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-gris-suave)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight"
                        style={{ color: !n.read ? 'var(--cuidar-tinta)' : 'var(--cuidar-gris-medio)' }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--cuidar-gris-suave)' }}>{n.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{timeAgo(n.createdAt)}</span>
                        {n.jobPostId && (
                          <button
                            onClick={() => { markRead(n.id); setOpen(false); onViewJob?.(n.jobPostId) }}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: 'var(--cuidar-verde-institucional)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
                            Ver búsqueda →
                          </button>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 flex-shrink-0 mt-1" style={{ borderRadius: '999px', background: 'var(--cuidar-verde-institucional)' }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
