import { useState } from 'react'
import { Search, MapPin, Tag, DollarSign, Bell, CheckCircle, ShieldCheck } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'infantil', label: 'Cuidado Infantil' },
  { value: 'pedagogico', label: 'Apoyo Pedagógico' },
  { value: 'salud', label: 'Salud Pediátrica' },
  { value: 'terapeutico', label: 'Cuidado Terapéutico' },
  { value: 'limpieza', label: 'Limpieza del Hogar' },
]

const ZONES = [
  { value: '', label: 'Todas las zonas' },
  { value: 'CABA', label: 'CABA' },
  { value: 'GBA_Norte', label: 'GBA Norte' },
  { value: 'GBA_Sur', label: 'GBA Sur' },
  { value: 'GBA_Oeste', label: 'GBA Oeste' },
]

const MAX_RATES = [
  { value: '', label: 'Cualquier tarifa' },
  { value: '5300', label: 'Hasta $5.300/hr' },
  { value: '6000', label: 'Hasta $6.000/hr' },
  { value: '8500', label: 'Hasta $8.500/hr' },
  { value: '11000', label: 'Hasta $11.000/hr' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label]))
const ZONE_LABELS = Object.fromEntries(ZONES.filter((z) => z.value).map((z) => [z.value, z.label]))

export default function DashboardParent() {
  const [filters, setFilters] = useState({ category: '', zone: '', maxRate: '' })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [notified, setNotified] = useState({})

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    )
    try {
      const res = await fetch(`${API_BASE}/api/match/search?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setResults(await res.json())
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleNotify = async (pro) => {
    try {
      await fetch(`${API_BASE}/api/match/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ professionalId: pro.userId, category: pro.category }),
      })
      setNotified((prev) => ({ ...prev, [pro.userId]: true }))
    } catch {
      /* silencioso — en prod mostrar toast de error */
    }
  }

  const selectClass =
    'w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-heading text-xl font-bold text-gray-800 mb-5">Buscar profesional</h2>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {/* Categoría */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={selectClass}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Zona */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={filters.zone} onChange={(e) => setFilter('zone', e.target.value)} className={selectClass}>
              {ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>

          {/* Presupuesto */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={filters.maxRate} onChange={(e) => setFilter('maxRate', e.target.value)} className={selectClass}>
              {MAX_RATES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 w-full sm:w-auto justify-center"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Buscando...' : 'Buscar profesionales'}
        </button>
      </div>

      {/* Resultados */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-14 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No encontramos profesionales con esos filtros.</p>
          <p className="text-xs mt-1">Probá ampliando la zona o el presupuesto.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium px-1">
            {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
          </p>

          {results.map((pro) => (
            <div
              key={pro.userId}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-bold text-gray-800">{pro.name}</h3>
                  {pro.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verificado
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {CATEGORY_LABELS[pro.category] ?? pro.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {ZONE_LABELS[pro.zone] ?? pro.zone}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-teal-600">
                    <DollarSign className="w-3.5 h-3.5" />
                    ${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleNotify(pro)}
                disabled={notified[pro.userId]}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                  notified[pro.userId]
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                {notified[pro.userId]
                  ? <><CheckCircle className="w-4 h-4" /> Notificado</>
                  : <><Bell className="w-4 h-4" /> Contactar y Notificar</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
