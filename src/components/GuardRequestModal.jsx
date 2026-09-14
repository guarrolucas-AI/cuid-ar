import { useState } from 'react'
import { X, AlertTriangle, Clock, Timer, FileText, Send } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const START_OPTIONS = [
  { value: 'immediate',   label: 'Inmediato' },
  { value: 'two_hours',   label: 'En 2 horas' },
  { value: 'night_shift', label: 'Turno Noche' },
]
const DURATION_OPTIONS = [
  { value: 'by_hour',  label: 'Por hora' },
  { value: 'half_day', label: 'Medio día' },
  { value: 'full_day', label: 'Jornada completa' },
]
const REASON_OPTIONS = [
  { value: 'work_surprise', label: 'Imprevisto laboral' },
  { value: 'replacement',   label: 'Reemplazo de emergencia' },
  { value: 'punctual',      label: 'Atención puntual' },
]

function OptionGroup({ icon: Icon, label, options, value, onChange }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={{ color: 'var(--cuidar-texto)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--cuidar-verde-institucional)' }} /> {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className="px-3 py-2.5 border-2 text-sm font-semibold transition-all text-center"
            style={value === opt.value
              ? { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)' }
              : { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
            onMouseEnter={e => { if (value !== opt.value) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
            onMouseLeave={e => { if (value !== opt.value) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GuardRequestModal({ pro, onClose, onSuccess }) {
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration]   = useState('')
  const [reason, setReason]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const ready = startTime && duration && reason

  const submit = async () => {
    if (!ready) return
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/match/guard-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          professionalId: pro.userId,
          category: pro.categories?.[0] ?? '',
          startTime, duration, reason,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al enviar la solicitud'); setLoading(false); return }
      onSuccess?.(data.conversationId)
    } catch {
      setError('No se pudo conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ background: '#FFFFFF', boxShadow: 'var(--cuidar-shadow-overlay)' }}>

        {/* Header */}
        <div className="p-6 flex items-start justify-between gap-4"
          style={{ background: 'var(--cuidar-nieve)', borderBottom: '2px solid var(--cuidar-verde-institucional)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--cuidar-nieve)', border: '2px solid var(--cuidar-borde)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>Solicitar Guardia Urgente</h2>
              <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--cuidar-verde-institucional)' }}>{pro?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 flex-shrink-0 transition-colors"
            style={{ color: 'var(--cuidar-gris-suave)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-tinta)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <p className="text-sm px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
            El profesional recibirá tu solicitud estructurada directamente en el chat de la plataforma. No se comparten datos de contacto.
          </p>

          <OptionGroup icon={Clock} label="Horario de inicio requerido" options={START_OPTIONS} value={startTime} onChange={setStartTime} />
          <OptionGroup icon={Timer} label="Duración estimada del servicio" options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
          <OptionGroup icon={FileText} label="Motivo principal" options={REASON_OPTIONS} value={reason} onChange={setReason} />

          {error && (
            <p className="text-sm px-4 py-2.5" style={{ color: 'var(--cuidar-coral-humano)', background: 'var(--cuidar-coral-soft)', border: '1px solid var(--cuidar-coral-humano)' }}>{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border-2 font-semibold text-sm transition-colors"
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-gris-medio)', background: '#FFFFFF' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
              Cancelar
            </button>
            <button onClick={submit} disabled={!ready || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors disabled:opacity-50 text-white"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => { if (!(!ready || loading)) e.currentTarget.style.background = 'var(--cuidar-verde-700)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
              <Send className="w-4 h-4" />
              {loading ? 'Enviando…' : 'Confirmar solicitud'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
