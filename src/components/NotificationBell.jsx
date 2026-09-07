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
  const [open, setOpen]               = useState(false)
  const [notifications, setNotifs]    = useState([])
  const [unread, setUnread]           = useState(0)
  const ref                           = useRef(null)

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
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'POST', headers: authH(),
      })
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH', headers: authH(),
      })
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      setUnread((prev) => Math.max(0, prev - 1))
    } catch {}
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); load() }}
        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        {unread > 0
          ? <BellRing className="w-5 h-5 text-teal-600" />
          : <Bell className="w-5 h-5 text-gray-500" />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-heading font-bold text-gray-800 text-sm">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Todo leído
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No hay notificaciones todavía.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 ${!n.read ? 'bg-teal-50/40' : 'bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-teal-100' : 'bg-gray-100'}`}>
                      <Briefcase className={`w-4 h-4 ${!n.read ? 'text-teal-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-gray-800' : 'text-gray-500'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                        {n.jobPostId && (
                          <button
                            onClick={() => { markRead(n.id); setOpen(false); onViewJob?.(n.jobPostId) }}
                            className="text-xs text-teal-600 font-semibold hover:text-teal-700"
                          >
                            Ver búsqueda →
                          </button>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1" />
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
