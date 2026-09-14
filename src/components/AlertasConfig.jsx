import { useState, useEffect } from 'react'
import { Bell, BellOff, MapPin, Tag, Save, RefreshCw } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const authH = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const ZONES_OPTS = [
  { value: 'CABA',      label: 'CABA' },
  { value: 'GBA_Norte', label: 'GBA Norte' },
  { value: 'GBA_Sur',   label: 'GBA Sur' },
  { value: 'GBA_Oeste', label: 'GBA Oeste' },
]
const CAT_OPTS = [
  { value: 'infantil',    label: 'Cuidado Infantil' },
  { value: 'pedagogico',  label: 'Apoyo Pedagógico' },
  { value: 'salud',       label: 'Salud Pediátrica' },
  { value: 'terapeutico', label: 'Cuidado Terapéutico' },
  { value: 'limpieza',    label: 'Limpieza del Hogar' },
]

export default function AlertasConfig() {
  const [cfg, setCfg]       = useState({ zones: [], categories: [], active: false })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/professional/alert-config`, { headers: authH() })
      .then(r => r.json())
      .then(data => {
        setCfg({ zones: data.zones ?? [], categories: data.categories ?? [], active: data.active ?? false })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const toggle = (key, value) =>
    setCfg(c => ({
      ...c,
      [key]: c[key].includes(value) ? c[key].filter(v => v !== value) : [...c[key], value],
    }))

  const toggleActive = async () => {
    const next = { ...cfg, active: !cfg.active }
    setCfg(next)
    try {
      await fetch(`${API_BASE}/api/professional/alert-config`, {
        method: 'PATCH', headers: authH(), body: JSON.stringify({ active: next.active }),
      })
    } catch {}
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`${API_BASE}/api/professional/alert-config`, {
        method: 'PATCH', headers: authH(), body: JSON.stringify(cfg),
      })
    } catch {}
    setSaving(false)
  }

  if (!loaded) return null

  const selStyle  = { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)' }
  const unselStyle = { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }

  return (
    <div className="border-2 overflow-hidden transition-colors"
      style={{ background: '#FFFFFF', borderColor: cfg.active ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-borde)' }}>

      {/* Header */}
      <div className="p-5 flex items-center justify-between gap-4"
        style={{ background: cfg.active ? 'var(--cuidar-nieve)' : '#FFFFFF' }}>
        <div className="flex items-center gap-3">
          {cfg.active
            ? <Bell className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
            : <BellOff className="w-5 h-5" style={{ color: 'var(--cuidar-gris-suave)' }} />}
          <div>
            <p className="font-heading font-bold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>Alertas de Trabajo</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>
              {cfg.active ? 'Recibís alertas cuando haya nuevas búsquedas' : 'Activá para recibir avisos de nuevas búsquedas'}
            </p>
          </div>
        </div>
        <button onClick={toggleActive}
          className="flex-shrink-0 px-4 py-2 text-sm font-semibold transition-colors"
          style={cfg.active
            ? { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }
            : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}
          onMouseEnter={e => cfg.active && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
          onMouseLeave={e => cfg.active && (e.currentTarget.style.background = 'var(--cuidar-verde-institucional)')}>
          {cfg.active ? 'Activas' : 'Activar'}
        </button>
      </div>

      {cfg.active && (
        <div className="p-5 space-y-4" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
          {/* Zonas */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--cuidar-gris-suave)', letterSpacing: '0.12em' }}>
              <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Zonas de interés
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES_OPTS.map(z => (
                <button key={z.value} type="button" onClick={() => toggle('zones', z.value)}
                  className="px-3 py-2 border-2 text-sm font-semibold transition-all text-left"
                  style={cfg.zones.includes(z.value) ? selStyle : unselStyle}>
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipos de servicio */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: 'var(--cuidar-gris-suave)', letterSpacing: '0.12em' }}>
              <Tag className="w-3.5 h-3.5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Tipos de servicio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAT_OPTS.map(c => (
                <button key={c.value} type="button" onClick={() => toggle('categories', c.value)}
                  className="px-3 py-2 border-2 text-xs font-semibold transition-all text-left"
                  style={cfg.categories.includes(c.value) ? selStyle : unselStyle}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold text-sm transition-colors disabled:opacity-60"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => !saving && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </button>
        </div>
      )}
    </div>
  )
}
