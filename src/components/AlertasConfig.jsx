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
  const [cfg, setCfg]     = useState({ zones: [], categories: [], active: false })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/professional/alert-config`, { headers: authH() })
      .then((r) => r.json())
      .then((data) => {
        setCfg({ zones: data.zones ?? [], categories: data.categories ?? [], active: data.active ?? false })
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const toggle = (key, value) =>
    setCfg((c) => ({
      ...c,
      [key]: c[key].includes(value) ? c[key].filter((v) => v !== value) : [...c[key], value],
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

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-colors ${cfg.active ? 'border-teal-200' : 'border-gray-100'}`}>
      {/* Header */}
      <div className={`p-5 flex items-center justify-between gap-4 ${cfg.active ? 'bg-teal-50' : ''}`}>
        <div className="flex items-center gap-3">
          {cfg.active
            ? <Bell className="w-5 h-5 text-teal-600" />
            : <BellOff className="w-5 h-5 text-gray-400" />}
          <div>
            <p className="font-heading font-bold text-gray-800 text-sm">Alertas de Trabajo</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {cfg.active ? 'Recibís alertas cuando haya nuevas búsquedas' : 'Activá para recibir avisos de nuevas búsquedas'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleActive}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            cfg.active ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cfg.active ? 'Activas' : 'Activar'}
        </button>
      </div>

      {cfg.active && (
        <div className="border-t border-teal-100 p-5 space-y-4">
          {/* Zonas */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-500" /> Zonas de interés
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES_OPTS.map((z) => (
                <button
                  key={z.value}
                  type="button"
                  onClick={() => toggle('zones', z.value)}
                  className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                    cfg.zones.includes(z.value)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipos de servicio */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              <Tag className="w-3.5 h-3.5 text-teal-500" /> Tipos de servicio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAT_OPTS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggle('categories', c.value)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                    cfg.categories.includes(c.value)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando…' : 'Guardar preferencias'}
          </button>
        </div>
      )}
    </div>
  )
}
