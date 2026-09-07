import { useState } from 'react'
import { X, Briefcase, MapPin, Calendar, Clock, Settings, Plus } from 'lucide-react'
import { CAT_STYLES } from '../lib/categoryStyles'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORIES = [
  { value: 'infantil',    label: 'Cuidado Infantil' },
  { value: 'pedagogico',  label: 'Apoyo Pedagógico' },
  { value: 'salud',       label: 'Salud Pediátrica' },
  { value: 'terapeutico', label: 'Cuidado Terapéutico' },
  { value: 'limpieza',    label: 'Limpieza del Hogar' },
]
const ZONES      = ['CABA', 'GBA Norte', 'GBA Sur', 'GBA Oeste']
const ZONE_VALS  = ['CABA', 'GBA_Norte', 'GBA_Sur', 'GBA_Oeste']
const DAYS_OPTS  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const SCHEDULES  = ['Mañana (8-12 hs)', 'Tarde (13-18 hs)', 'Noche (18-22 hs)', 'Día completo', 'A convenir']
const MODALITIES = ['Por hora', 'Turno fijo', 'Eventual']
const REQUIREMENTS_OPTS = [
  'Experiencia comprobable',
  'Referencias laborales',
  'Conocimiento en NEE',
  'Movilidad propia',
  'Disponibilidad inmediata',
  'Formación en primeros auxilios',
  'Manejo de personas mayores',
  'Con retiro (live-in)',
]

function SelectGrid({ options, selected, onChange, max }) {
  const toggle = (v) => {
    if (selected.includes(v)) {
      onChange(selected.filter((s) => s !== v))
    } else if (!max || selected.length < max) {
      onChange([...selected, v])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
            selected.includes(opt)
              ? 'border-teal-500 bg-teal-50 text-teal-700'
              : 'border-gray-200 text-gray-600 hover:border-teal-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function PublishJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    category: '', zone: '', days: [], schedule: '', modality: '', requirements: [], notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const ready = form.category && form.zone && form.schedule && form.modality

  const submit = async () => {
    if (!ready) return
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al publicar'); setLoading(false); return }
      onSuccess?.(data)
    } catch {
      setError('No se pudo conectar con el servidor')
      setLoading(false)
    }
  }

  const selectedCatStyle = form.category ? CAT_STYLES[form.category] : null

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className={`rounded-t-3xl ${selectedCatStyle?.bg ?? 'bg-teal-50'} border-b-2 ${selectedCatStyle?.border ?? 'border-teal-200'} p-6 flex items-start justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-800 leading-tight">Publicar una Búsqueda</h2>
              <p className="text-sm text-gray-500">Los profesionales de tu zona verán tu aviso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/60 transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Servicio */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 text-blue-500" /> Servicio requerido *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const s = CAT_STYLES[c.value]
                return (
                  <button key={c.value} type="button" onClick={() => set('category', c.value)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                      form.category === c.value ? `${s.border} ${s.bg} text-blue-700` : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}>
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Zona */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-blue-500" /> Zona / Ubicación *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((z, i) => (
                <button key={z} type="button" onClick={() => set('zone', ZONE_VALS[i])}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.zone === ZONE_VALS[i] ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}>
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Días */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Días requeridos
            </label>
            <SelectGrid options={DAYS_OPTS} selected={form.days} onChange={(v) => set('days', v)} />
          </div>

          {/* Horario */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-blue-500" /> Horario *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCHEDULES.map((s) => (
                <button key={s} type="button" onClick={() => set('schedule', s)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                    form.schedule === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Settings className="w-4 h-4 text-blue-500" /> Modalidad *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODALITIES.map((m) => (
                <button key={m} type="button" onClick={() => set('modality', m)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all text-center ${
                    form.modality === m ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Requerimientos */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
              <Plus className="w-4 h-4 text-blue-500" /> Requerimientos (opcional)
            </label>
            <SelectGrid options={REQUIREMENTS_OPTS} selected={form.requirements} onChange={(v) => set('requirements', v)} />
          </div>

          {/* Notas */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Observaciones (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Información adicional relevante para el profesional..."
              rows={2}
              maxLength={300}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:border-teal-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submit} disabled={!ready || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors">
              {loading ? 'Publicando…' : 'Publicar búsqueda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
