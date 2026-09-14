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

const btnBase = { background: '#FFFFFF', borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }
const btnSel  = { background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-verde-institucional)', color: 'var(--cuidar-verde-institucional)' }

function SelectGrid({ options, selected, onChange, max }) {
  const toggle = (v) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v))
    else if (!max || selected.length < max) onChange([...selected, v])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const sel = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="px-3 py-1.5 text-xs font-semibold border-2 transition-all"
            style={sel ? btnSel : btnBase}
            onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
            onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
            {opt}
          </button>
        )
      })}
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

  const catStyle = form.category ? CAT_STYLES[form.category] : null

  const labelStyle = { color: 'var(--cuidar-texto)' }
  const iconStyle  = { color: 'var(--cuidar-verde-institucional)' }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: '#FFFFFF', boxShadow: 'var(--cuidar-shadow-overlay)' }}>

        {/* Header */}
        <div className="p-6 flex items-start justify-between gap-4"
          style={{ background: 'var(--cuidar-nieve)', borderBottom: '2px solid var(--cuidar-verde-institucional)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--cuidar-nieve)', border: '2px solid var(--cuidar-borde)' }}>
              <Briefcase className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>Publicar una Búsqueda</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--cuidar-gris-medio)' }}>Los profesionales de tu zona verán tu aviso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 flex-shrink-0 transition-colors"
            style={{ color: 'var(--cuidar-gris-suave)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-tinta)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Servicio */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <Briefcase className="w-4 h-4" style={iconStyle} /> Servicio requerido *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => {
                const sel = form.category === c.value
                return (
                  <button key={c.value} type="button" onClick={() => set('category', c.value)}
                    className="px-3 py-2.5 border-2 text-xs font-semibold transition-all text-left"
                    style={sel ? btnSel : btnBase}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Zona */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <MapPin className="w-4 h-4" style={iconStyle} /> Zona / Ubicación *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((z, i) => {
                const sel = form.zone === ZONE_VALS[i]
                return (
                  <button key={z} type="button" onClick={() => set('zone', ZONE_VALS[i])}
                    className="px-3 py-2.5 border-2 text-sm font-semibold transition-all"
                    style={sel ? btnSel : btnBase}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
                    {z}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Días */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <Calendar className="w-4 h-4" style={iconStyle} /> Días requeridos
            </label>
            <SelectGrid options={DAYS_OPTS} selected={form.days} onChange={(v) => set('days', v)} />
          </div>

          {/* Horario */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <Clock className="w-4 h-4" style={iconStyle} /> Horario *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SCHEDULES.map((s) => {
                const sel = form.schedule === s
                return (
                  <button key={s} type="button" onClick={() => set('schedule', s)}
                    className="px-3 py-2.5 border-2 text-sm font-semibold transition-all text-left"
                    style={sel ? btnSel : btnBase}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Modalidad */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <Settings className="w-4 h-4" style={iconStyle} /> Modalidad *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODALITIES.map((m) => {
                const sel = form.modality === m
                return (
                  <button key={m} type="button" onClick={() => set('modality', m)}
                    className="px-3 py-2.5 border-2 text-sm font-semibold transition-all text-center"
                    style={sel ? btnSel : btnBase}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Requerimientos */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold mb-2" style={labelStyle}>
              <Plus className="w-4 h-4" style={iconStyle} /> Requerimientos (opcional)
            </label>
            <SelectGrid options={REQUIREMENTS_OPTS} selected={form.requirements} onChange={(v) => set('requirements', v)} />
          </div>

          {/* Notas */}
          <div>
            <label className="text-sm font-semibold mb-1 block" style={labelStyle}>Observaciones (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Información adicional relevante para el profesional..."
              rows={2}
              maxLength={300}
              className="w-full px-4 py-3 border-2 text-sm resize-none outline-none"
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
            />
          </div>

          {error && (
            <p className="text-sm px-4 py-2.5"
              style={{ color: 'var(--cuidar-coral-humano)', background: 'var(--cuidar-coral-soft)', border: '1px solid var(--cuidar-coral-humano)' }}>
              {error}
            </p>
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
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm disabled:opacity-50 text-white transition-colors"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => { if (!(!ready || loading)) e.currentTarget.style.background = 'var(--cuidar-verde-700)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
              {loading ? 'Publicando…' : 'Publicar búsqueda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
