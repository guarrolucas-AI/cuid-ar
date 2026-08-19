import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Tag, DollarSign, ShieldCheck, Lock, Navigation, Heart, ArrowLeft, Calculator, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'infantil', label: 'Cuidado Infantil' },
  { value: 'pedagogico', label: 'Apoyo Pedagógico' },
  { value: 'salud', label: 'Salud Pediátrica' },
  { value: 'terapeutico', label: 'Cuidado Terapéutico' },
  { value: 'limpieza', label: 'Limpieza del Hogar' },
]
const CAT_LABELS = Object.fromEntries(CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label]))
const ZONE_LABELS = { CABA: 'CABA', GBA_Norte: 'GBA Norte', GBA_Sur: 'GBA Sur', GBA_Oeste: 'GBA Oeste' }

// Página pública: cualquier visitante navega esto sin cuenta, como pide la
// especificación de niveles de acceso. Si comparte su ubicación ve
// distancia real; si no, ve el listado igual (sin distancia, ordenado por
// tarifa) — el backend degrada solo, no hace falta duplicar esa lógica acá.
const VALID_CATEGORIES = CATEGORIES.filter((c) => c.value).map((c) => c.value)

export default function SearchPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialCategory = VALID_CATEGORIES.includes(searchParams.get('category')) ? searchParams.get('category') : ''
  const [category, setCategory] = useState(initialCategory)
  const [coords, setCoords] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | asking | granted | denied | unsupported
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const runSearch = useCallback(async (loc) => {
    setLoading(true)
    const params = new URLSearchParams({ ...(category && { category }) })
    if (loc) { params.set('lat', loc.lat); params.set('lng', loc.lng) }
    try {
      const headers = {}
      const token = localStorage.getItem('token')
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/api/match/search?${params}`, { headers })
      setResults(await res.json())
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [category])

  const requestLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('unsupported'); runSearch(null); return }
    setGeoStatus('asking')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(loc)
        setGeoStatus('granted')
        runSearch(loc)
      },
      () => { setGeoStatus('denied'); runSearch(null) },
      { timeout: 8000 }
    )
  }

  useEffect(() => {
    requestLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (geoStatus === 'idle' || geoStatus === 'asking') return
    runSearch(coords)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const subscribed = user?.status === 'subscribed'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-heading font-bold text-lg">
              <span className="text-teal-500">CUID</span><span className="text-gray-700">_AR</span>
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-teal-600">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Buscar un profesional</h1>
          <p className="text-gray-500 text-sm">
            {geoStatus === 'granted'
              ? 'Ordenado por cercanía a tu ubicación.'
              : 'Compartí tu ubicación para ver los profesionales más cerca tuyo.'}
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {geoStatus !== 'granted' && (
            <button onClick={requestLocation} disabled={geoStatus === 'asking'}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-50 text-teal-700 font-semibold rounded-xl text-sm hover:bg-teal-100 transition-colors disabled:opacity-60">
              <Navigation className="w-4 h-4" />
              {geoStatus === 'asking' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
            </button>
          )}
        </div>

        {geoStatus === 'denied' && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            No pudimos acceder a tu ubicación — mostramos el listado sin ordenar por distancia. Podés habilitarla desde el navegador y volver a intentar.
          </p>
        )}

        <MultiServiceCalculator />

        {/* Resultados */}
        {loading ? (
          <p className="text-center text-gray-400 py-14 text-sm">Buscando profesionales…</p>
        ) : results.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Todavía no hay profesionales disponibles con estos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium px-1">
              {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((pro) => (
              <div key={pro.userId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {pro.photoUrl
                    ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />
                    : <span className="font-heading font-bold text-teal-500 text-lg">{pro.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-heading font-bold text-gray-800">{pro.name}</h3>
                    {pro.verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />Verificado
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{(pro.categories ?? []).map(c => CAT_LABELS[c] ?? c).join(', ')}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />
                      {pro.distanceKm != null ? `${pro.distanceKm} km` : (ZONE_LABELS[pro.zone] ?? pro.zone)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-teal-600">
                      <DollarSign className="w-3.5 h-3.5" />${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                    </span>
                  </div>
                  {subscribed && pro.officialRate != null && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Valor oficial de referencia para {(CAT_LABELS[category] ?? CAT_LABELS[pro.categories?.[0]] ?? '')?.toLowerCase()}: ${Number(pro.officialRate).toLocaleString('es-AR')}/hr
                    </p>
                  )}
                  {subscribed && pro.certifications?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{pro.certifications.join(' · ')}</p>
                  )}
                </div>

                {subscribed ? (
                  <Link to="/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-teal-500 text-white hover:bg-teal-600 transition-colors flex-shrink-0">
                    Contactar
                  </Link>
                ) : (
                  <Link to="/register?role=padre"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0">
                    <Lock className="w-3.5 h-3.5" />Registrate para contactar
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Calculadora de tarifa combinada (multiservicio) ────────────────────────
// "Si un usuario requiere 2+ servicios simultáneos... el sistema calcula y
// muestra una tarifa combinada estimada de referencia, editable por el
// usuario." Puramente informativo — no crea nada en el backend, solo suma
// las tarifas oficiales de las categorías elegidas contra /api/match/rates.
function MultiServiceCalculator() {
  const [open, setOpen] = useState(false)
  const [rates, setRates] = useState({})
  const [tolerance, setTolerance] = useState(5000)
  const [selected, setSelected] = useState([])
  const [customValue, setCustomValue] = useState('')

  useEffect(() => {
    if (!open || Object.keys(rates).length) return
    fetch(`${API_BASE}/api/match/rates`)
      .then((r) => r.json())
      .then((data) => { setRates(data.rates ?? {}); setTolerance(data.toleranceArs ?? 5000) })
      .catch(() => {})
  }, [open, rates])

  const toggle = (value) => {
    setSelected((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]))
  }

  const configuredSelected = selected.filter((v) => rates[v] != null)
  const missingSelected = selected.filter((v) => rates[v] == null)
  const suggestedTotal = configuredSelected.reduce((sum, v) => sum + Number(rates[v]), 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left">
        <span className="flex items-center gap-2 font-heading font-bold text-gray-800">
          <Calculator className="w-5 h-5 text-teal-500" />
          ¿Necesitás más de un servicio a la vez?
        </span>
        <span className="text-xs font-semibold text-teal-600">{open ? 'Cerrar' : 'Calcular tarifa combinada'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Elegí los servicios que necesitás en simultáneo (ej. niñera + acompañante terapéutico en el mismo
            horario) y te mostramos una referencia combinada según los valores oficiales.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.filter((c) => c.value).map((c) => (
              <button key={c.value} type="button" onClick={() => toggle(c.value)}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                  selected.includes(c.value)
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-teal-300'
                }`}>
                {c.label}
              </button>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="bg-teal-50 rounded-xl p-4 space-y-2">
              {configuredSelected.length > 0 && (
                <p className="text-sm text-gray-700">
                  Referencia combinada estimada:{' '}
                  <strong className="text-teal-700">${suggestedTotal.toLocaleString('es-AR')}/hr</strong>
                  {' '}<span className="text-gray-500">(± ${Number(tolerance).toLocaleString('es-AR')} de tolerancia)</span>
                </p>
              )}
              {missingSelected.length > 0 && (
                <p className="text-xs text-amber-600">
                  Todavía no hay valor oficial cargado para: {missingSelected.map((v) => CAT_LABELS[v]).join(', ')}.
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tu valor combinado (editable)</label>
                <div className="relative max-w-[12rem]">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" step="100" value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder={suggestedTotal ? String(suggestedTotal) : '0'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
