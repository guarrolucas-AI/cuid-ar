import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, MapPin, Tag, DollarSign, ShieldCheck, Lock, Navigation,
  Heart, ArrowLeft, Calculator, Info, Bookmark, BookmarkCheck, X, Star,
  Zap, Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CAT_STYLES, getCatStyle } from '../lib/categoryStyles'
import GuardRequestModal from '../components/GuardRequestModal'
import PublishJobModal from '../components/PublishJobModal'
import PreselectionGuideToast, { usePreselectionGuide } from '../components/PreselectionGuideToast'

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
const VALID_CATEGORIES = CATEGORIES.filter((c) => c.value).map((c) => c.value)

// ── Preselección (localStorage) ──────────────────────────────────────────
function usePreselection() {
  const [preselected, setPreselected] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cuidar_preselection') || '[]') } catch { return [] }
  })

  const toggle = (pro) => {
    setPreselected((prev) => {
      const exists = prev.some((p) => p.userId === pro.userId)
      const next = exists ? prev.filter((p) => p.userId !== pro.userId) : [...prev, pro]
      try { localStorage.setItem('cuidar_preselection', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const isSelected = (userId) => preselected.some((p) => p.userId === userId)

  return { preselected, toggle, isSelected }
}

// ── Estrellas (solo lectura) ─────────────────────────────────────────────
function StarRating({ rating, count }) {
  const filled = Math.round(rating ?? 0)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`w-3.5 h-3.5 ${n <= filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
      {count > 0
        ? <span className="text-xs text-gray-500">{Number(rating).toFixed(1)} ({count} reseña{count !== 1 ? 's' : ''})</span>
        : <span className="text-xs text-gray-400">Sin reseñas aún</span>}
    </div>
  )
}

// ── Drawer de preseleccionados ────────────────────────────────────────────
function PreselectionDrawer({ preselected, isOpen, onClose, onRemove, subscribed }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-800">Mis preseleccionados</h2>
            <p className="text-xs text-gray-500">
              {preselected.length} perfil{preselected.length !== 1 ? 'es' : ''} guardado{preselected.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {preselected.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <BookmarkCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Todavía no guardaste ningún perfil.</p>
              <p className="text-xs mt-1">Hacé clic en el ícono de marcador en cualquier resultado.</p>
            </div>
          ) : (
            preselected.map((pro) => {
              const style = getCatStyle(pro.categories)
              return (
                <div key={pro.userId} className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4 flex items-start gap-3`}>
                  <div className={`w-11 h-11 rounded-xl ${style.avatarBg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {pro.photoUrl
                      ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />
                      : <span className="font-heading font-bold text-blue-500 text-base">{pro.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-gray-800 text-sm leading-tight">{pro.name}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {(pro.categories ?? []).map((c) => CAT_LABELS[c] ?? c).join(', ')}
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-0.5">
                      ${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(pro)}
                    className="p-1.5 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {preselected.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-2">
            {subscribed ? (
              <Link
                to="/dashboard"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Ir al panel para contactar
              </Link>
            ) : (
              <Link
                to="/register?role=padre"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Registrarse para conectar
              </Link>
            )}
            <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
              Seguir buscando
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Página principal ─────────────────────────────────────────────────────
export default function SearchPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialCategory = VALID_CATEGORIES.includes(searchParams.get('category')) ? searchParams.get('category') : ''
  const [category, setCategory] = useState(initialCategory)
  const [coords, setCoords] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [onDutyOnly, setOnDutyOnly]     = useState(false)
  const [guardTarget, setGuardTarget]   = useState(null)
  const [publishOpen, setPublishOpen]   = useState(false)
  const { preselected, toggle: togglePreselect, isSelected } = usePreselection()
  const { visible: guideVisible, trigger: triggerGuide, dismiss: dismissGuide } = usePreselectionGuide()

  const handlePreselect = (pro) => {
    const wasSelected = isSelected(pro.userId)
    togglePreselect(pro)
    if (!wasSelected) triggerGuide()
  }

  useEffect(() => {
    if (geoStatus === 'idle' || geoStatus === 'asking') return
    runSearch(coords)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDutyOnly])

  const runSearch = useCallback(async (loc) => {
    setLoading(true)
    const params = new URLSearchParams({ ...(category && { category }), ...(onDutyOnly && { onDuty: 'true' }) })
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
  }, [category, onDutyOnly])

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Preseleccionados</span>
              {preselected.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center leading-none">
                  {preselected.length}
                </span>
              )}
            </button>
            <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Buscar un profesional</h1>
          <p className="text-base text-gray-500">
            {geoStatus === 'granted'
              ? 'Ordenado por cercanía a tu ubicación.'
              : 'Compartí tu ubicación para ver los profesionales más cerca tuyo.'}
          </p>
        </div>

        {/* Toggle guardia */}
        <button
          onClick={() => setOnDutyOnly((v) => !v)}
          className={`flex items-center gap-3 w-full p-4 rounded-2xl border-2 font-semibold transition-all ${
            onDutyOnly
              ? 'border-green-400 bg-green-50 text-green-800 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
          }`}
        >
          <div className={`w-10 h-6 rounded-full transition-all flex-shrink-0 flex items-center px-1 ${onDutyOnly ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow" />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Zap className={`w-5 h-5 flex-shrink-0 ${onDutyOnly ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-base">Disponibilidad Hoy / Guardia Urgente</span>
            {onDutyOnly && (
              <span className="ml-auto text-xs font-bold bg-green-500 text-white px-2.5 py-0.5 rounded-full flex-shrink-0">ACTIVO</span>
            )}
          </div>
        </button>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {geoStatus !== 'granted' && (
            <button
              onClick={requestLocation}
              disabled={geoStatus === 'asking'}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-50 text-teal-700 font-semibold rounded-xl text-sm hover:bg-teal-100 transition-colors disabled:opacity-60"
            >
              <Navigation className="w-4 h-4" />
              {geoStatus === 'asking' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
            </button>
          )}
        </div>

        {/* Pills de categoría por color */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.value).map((c) => {
            const style = CAT_STYLES[c.value]
            const active = category === c.value
            return (
              <button
                key={c.value}
                onClick={() => setCategory(active ? '' : c.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${style.border} ${
                  active ? `${style.bg} text-blue-700 shadow-sm` : 'bg-white text-gray-500 hover:text-blue-600'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {geoStatus === 'denied' && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            No pudimos acceder a tu ubicación — mostramos el listado sin ordenar por distancia. Podés habilitarla desde el navegador y volver a intentar.
          </p>
        )}

        <MultiServiceCalculator />

        {/* Resultados */}
        {loading ? (
          <p className="text-center text-gray-400 py-14">Buscando profesionales…</p>
        ) : results.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Todavía no hay profesionales disponibles con estos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium px-1">
              {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((pro) => {
              const style = getCatStyle(pro.categories)
              const saved = isSelected(pro.userId)
              return (
                <div
                  key={pro.userId}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${style.border} flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-md transition-all duration-200`}
                >
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-2xl ${style.avatarBg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {pro.photoUrl
                      ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />
                      : <span className="font-heading font-bold text-blue-500 text-2xl">{pro.name?.[0]?.toUpperCase()}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Nombre + badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-heading font-bold text-gray-800 text-lg leading-tight">{pro.name}</h3>
                      {pro.onDuty && (
                        <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                          <Zap className="w-3 h-3" /> Disponible Hoy
                        </span>
                      )}
                      {pro.verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Documentación Verificada
                        </span>
                      )}
                    </div>

                    {/* Estrellas */}
                    <StarRating rating={pro.rating ?? null} count={pro.reviewCount ?? 0} />

                    {/* Categoría + distancia + tarifa */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                        <Tag className="w-3 h-3" />
                        {(pro.categories ?? []).map((c) => CAT_LABELS[c] ?? c).join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {pro.distanceKm != null ? `${pro.distanceKm} km` : (ZONE_LABELS[pro.zone] ?? pro.zone)}
                      </span>
                      <span className="flex items-center gap-1 text-base font-bold text-gray-800">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        ${Number(pro.hourlyRate).toLocaleString('es-AR')}
                        <span className="text-sm font-normal text-gray-500">/hr</span>
                      </span>
                    </div>

                    {subscribed && pro.officialRate != null && (
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Valor oficial de referencia: ${Number(pro.officialRate).toLocaleString('es-AR')}/hr
                      </p>
                    )}
                    {subscribed && pro.certifications?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{pro.certifications.join(' · ')}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:items-stretch">
                    <button
                      onClick={() => handlePreselect(pro)}
                      title={saved ? 'Quitar de preseleccionados' : 'Preseleccionar'}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                        saved
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      {saved ? 'Guardado' : 'Preseleccionar'}
                    </button>

                    {subscribed ? (
                      onDutyOnly && pro.onDuty ? (
                        <button
                          onClick={() => setGuardTarget(pro)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          <Zap className="w-4 h-4" /> Solicitar Guardia
                        </button>
                      ) : (
                        <Link
                          to="/dashboard"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                        >
                          Conectar
                        </Link>
                      )
                    ) : (
                      <Link
                        to="/register?role=padre"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" /> Cotizar
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <PreselectionDrawer
        preselected={preselected}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRemove={togglePreselect}
        subscribed={subscribed}
      />

      {guardTarget && (
        <GuardRequestModal
          pro={guardTarget}
          onClose={() => setGuardTarget(null)}
          onSuccess={() => { setGuardTarget(null); window.location.href = '/dashboard' }}
        />
      )}

      {publishOpen && (
        <PublishJobModal
          onClose={() => setPublishOpen(false)}
          onSuccess={() => { setPublishOpen(false) }}
        />
      )}

      {/* FAB: Publicar búsqueda (solo familias logueadas) */}
      {user?.role === 'padre' && (
        <button
          onClick={() => setPublishOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all z-30 text-sm"
        >
          <Plus className="w-5 h-5" /> Publicar búsqueda
        </button>
      )}

      {/* Toast guía de preselección (primera vez) */}
      <PreselectionGuideToast
        visible={guideVisible}
        onDismiss={dismissGuide}
        onOpenDrawer={() => setDrawerOpen(true)}
      />
    </div>
  )
}

// ── Calculadora de tarifa combinada (multiservicio) ────────────────────────
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex items-center gap-2 font-heading font-bold text-gray-800">
          <Calculator className="w-5 h-5 text-teal-500" />
          ¿Necesitás más de un servicio a la vez?
        </span>
        <span className="text-xs font-semibold text-teal-600">{open ? 'Cerrar' : 'Calcular tarifa combinada'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Elegí los servicios que necesitás en simultáneo y te mostramos una referencia combinada según los valores oficiales.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.filter((c) => c.value).map((c) => {
              const style = CAT_STYLES[c.value]
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggle(c.value)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                    selected.includes(c.value)
                      ? `${style.border} ${style.bg} text-blue-700`
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {c.label}
                </button>
              )
            })}
          </div>

          {selected.length > 0 && (
            <div className="bg-teal-50 rounded-xl p-4 space-y-2">
              {configuredSelected.length > 0 && (
                <p className="text-sm text-gray-700">
                  Referencia combinada estimada:{' '}
                  <strong className="text-teal-700 text-base">${suggestedTotal.toLocaleString('es-AR')}/hr</strong>
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
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder={suggestedTotal ? String(suggestedTotal) : '0'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
