import { useState } from 'react'
import { X, AlertTriangle, Clock, Timer, FileText, Send } from 'lucide-react'
import { getCatStyle } from '../lib/categoryStyles'

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
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
        <Icon className="w-4 h-4 text-blue-500" /> {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-center ${
              value === opt.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
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

  const style = getCatStyle(pro?.categories)
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
          startTime,
          duration,
          reason,
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className={`rounded-t-3xl ${style.bg} border-b-2 ${style.border} p-6 flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-800 leading-tight">Solicitar Guardia Urgente</h2>
              <p className="text-sm text-blue-600 font-medium">{pro?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/60 transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            El profesional recibirá tu solicitud estructurada directamente en el chat de la plataforma. No se comparten datos de contacto.
          </p>

          <OptionGroup
            icon={Clock}
            label="Horario de inicio requerido"
            options={START_OPTIONS}
            value={startTime}
            onChange={setStartTime}
          />

          <OptionGroup
            icon={Timer}
            label="Duración estimada del servicio"
            options={DURATION_OPTIONS}
            value={duration}
            onChange={setDuration}
          />

          <OptionGroup
            icon={FileText}
            label="Motivo principal"
            options={REASON_OPTIONS}
            value={reason}
            onChange={setReason}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={!ready || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Enviando…' : 'Confirmar solicitud'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
