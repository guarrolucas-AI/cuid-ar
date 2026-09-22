import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function IdentityBanner({ notify }) {
  const [status, setStatus]           = useState(null)
  const [hasCert, setHasCert]         = useState(false)
  const [notes, setNotes]             = useState(null)
  const [daysRemaining, setDays]      = useState(null)
  const [isSuspended, setIsSuspended] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/professional/identity-status`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(r => r.json()).then(d => {
      setStatus(d.status)
      setHasCert(d.hasCertificado)
      setNotes(d.notes)
      setDays(d.daysRemaining)
      setIsSuspended(d.isSuspended)
    }).catch(() => {})
  }, [])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') { notify('Solo se acepta PDF', false); return }
    if (file.size > 5 * 1024 * 1024) { notify('El archivo no puede superar 5 MB', false); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('certificate', file)
      const res = await fetch(`${API_BASE}/api/professional/certificate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus(data.status)
      setHasCert(true)
      notify('Certificado enviado — el equipo lo revisará pronto')
    } catch (err) { notify(err.message, false) }
    setUploading(false)
  }

  if (!status || status === 'clear') return null

  // Cuenta suspendida — banner urgente con CTA a la página de carga
  if (isSuspended) {
    return (
      <div className="p-4 border-l-4" style={{ background: '#FEF2F2', borderColor: '#EF4444' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: '#991B1B' }}>🚨 Cuenta suspendida</p>
            <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
              Tu cuenta fue suspendida porque venció el plazo para presentar el Certificado de Antecedentes Penales.
              Subilo ahora para reactivarla.
            </p>
          </div>
          <button type="button" onClick={() => navigate('/cargar-antecedentes')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold flex-shrink-0"
            style={{ background: '#EF4444', color: '#fff' }}>
            Subir certificado
          </button>
        </div>
      </div>
    )
  }

  const CONFIG = {
    pending:       { bg: '#FFF7ED', border: '#F59E0B', color: '#92400E', icon: '⏳', label: 'Verificación pendiente',   msg: 'Subí tu Certificado de Antecedentes Penales para que el equipo lo revise.' },
    manual_review: { bg: '#EFF6FF', border: '#3B82F6', color: '#1E3A8A', icon: '🔍', label: 'En revisión',              msg: 'El equipo de CuidAR 360 está revisando tu certificado. Te avisaremos por email.' },
    flagged:       { bg: '#FEF2F2', border: '#EF4444', color: '#991B1B', icon: '⚠️', label: 'Observación en tu cuenta', msg: notes ?? 'Hay una observación sobre tu certificado.' },
  }
  const c = CONFIG[status] ?? CONFIG.pending

  return (
    <div className="p-4 border-l-4" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: c.color }}>{c.icon} {c.label}</p>
          <p className="text-xs mt-1" style={{ color: c.color }}>{c.msg}</p>
          {daysRemaining !== null && daysRemaining <= 5 && status !== 'manual_review' && (
            <p className="text-xs mt-1 font-semibold" style={{ color: c.color }}>
              {daysRemaining === 0
                ? '⚠️ Vence hoy — tu cuenta puede suspenderse en cualquier momento.'
                : `⏰ Tenés ${daysRemaining} día${daysRemaining === 1 ? '' : 's'} para subir el certificado.`}
            </p>
          )}
          {status === 'flagged' && (
            <p className="text-xs mt-1" style={{ color: c.color }}>
              Podés re-enviar el certificado corregido usando el botón de la derecha, o comunicarte a{' '}
              <a href="mailto:info@cuidar360.com.ar" style={{ textDecoration: 'underline' }}>info@cuidar360.com.ar</a>.
            </p>
          )}
        </div>
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold flex-shrink-0 disabled:opacity-60"
          style={{ background: c.border, color: '#fff' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
          {hasCert ? 'Reenviar PDF' : 'Subir PDF'}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
