import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search, MapPin, Tag, DollarSign, ShieldCheck, Lock, Navigation,
  ArrowLeft, Calculator, Info, Bookmark, BookmarkCheck, X, Star,
  Zap, Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CAT_STYLES, getCatStyle } from '../lib/categoryStyles'
import { Isotipo } from '../lib/Isotipo'
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

function StarRating({ rating, count }) {
  const filled = Math.round(rating ?? 0)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n}
            className={`w-3.5 h-3.5 ${n <= filled ? 'text-amber-400 fill-amber-400' : 'fill-current'}`}
            style={n > filled ? { color: 'var(--cuidar-borde)' } : undefined}
          />
        ))}
      </div>
      {count > 0
        ? <span className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{Number(rating).toFixed(1)} ({count} reseña{count !== 1 ? 's' : ''})</span>
        : <span className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>Sin reseñas aún</span>}
    </div>
  )
}

function PreselectionDrawer({ preselected, isOpen, onClose, onRemove, subscribed }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 z-50 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#FFFFFF', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--cuidar-borde)' }}>
          <div>
            <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--cuidar-tinta)' }}>Mis preseleccionados</h2>
            <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>
              {preselected.length} perfil{preselected.length !== 1 ? 'es' : ''} guardado{preselected.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 transition-colors"
            style={{ color: 'var(--cuidar-gris-suave)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {preselected.length === 0 ? (
            <div className="text-center py-14" style={{ color: 'var(--cuidar-gris-suave)' }}>
              <BookmarkCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Todavía no guardaste ningún perfil.</p>
              <p className="text-xs mt-1">Hacé clic en el ícono de marcador en cualquier resultado.</p>
            </div>
          ) : (
            preselected.map((pro) => {
              const style = getCatStyle(pro.categories)
              return (
                <div key={pro.userId} className="border p-4 flex items-start gap-3"
                  style={{ borderColor: 'var(--cuidar-borde)', background: 'var(--cuidar-nieve)' }}>
                  {/* Photo SQUARE — brand rule: never circular */}
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--cuidar-borde)' }}>
                    {pro.photoUrl
                      ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" style={{ aspectRatio: '1/1' }} />
                      : <span className="font-heading font-bold text-base" style={{ color: 'var(--cuidar-verde-institucional)' }}>{pro.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>{pro.name}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--cuidar-verde-institucional)' }}>
                      {(pro.categories ?? []).map((c) => CAT_LABELS[c] ?? c).join(', ')}
                    </p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--cuidar-tinta)' }}>
                      ${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                    </p>
                  </div>
                  <button onClick={() => onRemove(pro)} className="p-1.5 transition-colors flex-shrink-0"
                    style={{ color: 'var(--cuidar-gris-suave)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = 'var(--cuidar-coral-humano)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cuidar-gris-suave)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {preselected.length > 0 && (
          <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
            {subscribed ? (
              <Link to="/dashboard" onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-sm text-white transition-colors"
                style={{ background: 'var(--cuidar-verde-institucional)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
                Ir al panel para contactar
              </Link>
            ) : (
              <Link to="/register?role=padre" onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-sm text-white transition-colors"
                style={{ background: 'var(--cuidar-verde-institucional)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
                Registrarse para conectar
              </Link>
            )}
            <button onClick={onClose} className="w-full text-xs py-1 transition-colors"
              style={{ color: 'var(--cuidar-gris-suave)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-gris-medio)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
              Seguir buscando
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default function SearchPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialCategory = VALID_CATEGORIES.includes(searchParams.get('category')) ? searchParams.get('category') : ''
  const [category, setCategory] = useState(initialCategory)
  const [coords, setCoords] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [onDutyOnly, setOnDutyOnly]   = useState(false)
  const [guardTarget, setGuardTarget] = useState(null)
  const [publishOpen, setPublishOpen] = useState(false)
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
    <div className="min-h-screen" style={{ background: 'var(--cuidar-nieve)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--cuidar-borde)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Isotipo className="w-8 h-8" />
            <span className="font-heading font-bold text-lg" style={{ color: 'var(--cuidar-tinta)' }}>
              CuidAR <span style={{ color: 'var(--cuidar-verde-institucional)' }}>360</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 font-semibold text-sm border transition-colors"
              style={{ background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'; e.currentTarget.style.color = 'var(--cuidar-verde-institucional)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cuidar-borde)'; e.currentTarget.style.color = 'var(--cuidar-texto)' }}>
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Preseleccionados</span>
              {preselected.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-xs font-bold flex items-center justify-center leading-none"
                  style={{ background: 'var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                  {preselected.length}
                </span>
              )}
            </button>
            <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: 'var(--cuidar-gris-suave)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
              <ArrowLeft className="w-4 h-4" /> Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>Buscar un profesional</h1>
          <p className="text-base" style={{ color: 'var(--cuidar-gris-suave)' }}>
            {geoStatus === 'granted'
              ? 'Ordenado por cercanía a tu ubicación.'
              : 'Compartí tu ubicación para ver los profesionales más cerca tuyo.'}
          </p>
        </div>

        {/* Toggle guardia */}
        <button onClick={() => setOnDutyOnly((v) => !v)}
          className="flex items-center gap-3 w-full p-4 border-2 font-semibold transition-all"
          style={{
            borderColor: onDutyOnly ? '#16a34a' : 'var(--cuidar-borde)',
            background: onDutyOnly ? '#f0fdf4' : '#FFFFFF',
            color: onDutyOnly ? '#14532d' : 'var(--cuidar-gris-medio)',
          }}>
          {/* Toggle pill — functional UI element, green is semantically correct for "on duty" */}
          <div className="w-10 h-6 transition-all flex-shrink-0 flex items-center px-1"
            style={{ background: onDutyOnly ? '#16a34a' : 'var(--cuidar-borde)', borderRadius: '999px', justifyContent: onDutyOnly ? 'flex-end' : 'flex-start' }}>
            <div className="w-4 h-4 bg-white" style={{ borderRadius: '999px', boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Zap className="w-5 h-5 flex-shrink-0" style={{ color: onDutyOnly ? '#16a34a' : 'var(--cuidar-gris-suave)' }} />
            <span className="text-base">Disponibilidad Hoy / Guardia Urgente</span>
            {onDutyOnly && (
              <span className="ml-auto text-xs font-bold text-white px-2.5 py-0.5 flex-shrink-0"
                style={{ background: '#16a34a', borderRadius: '999px' }}>ACTIVO</span>
            )}
          </div>
        </button>

        {/* Filtros */}
        <div className="p-5 border flex flex-col sm:flex-row gap-3" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-3 border text-sm outline-none appearance-none"
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {geoStatus !== 'granted' && (
            <button onClick={requestLocation} disabled={geoStatus === 'asking'}
              className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-sm disabled:opacity-60 transition-colors"
              style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}>
              <Navigation className="w-4 h-4" />
              {geoStatus === 'asking' ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
            </button>
          )}
        </div>

        {/* Pills de categoría */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.value).map((c) => {
            const style = CAT_STYLES[c.value]
            const active = category === c.value
            return (
              <button key={c.value} onClick={() => setCategory(active ? '' : c.value)}
                className={`px-4 py-2 text-sm font-semibold border-2 transition-all ${style.border} ${
                  active ? style.bg : ''
                }`}
                style={active
                  ? { color: 'var(--cuidar-tinta)' }
                  : { background: '#FFFFFF', color: 'var(--cuidar-gris-medio)' }}>
                {c.label}
              </button>
            )
          })}
        </div>

        {geoStatus === 'denied' && (
          <p className="text-sm px-4 py-2.5 border" style={{ color: '#92400e', background: '#fffbeb', borderColor: '#fcd34d' }}>
            No pudimos acceder a tu ubicación — mostramos el listado sin ordenar por distancia. Podés habilitarla desde el navegador y volver a intentar.
          </p>
        )}

        <MultiServiceCalculator />

        {/* Resultados */}
        {loading ? (
          <p className="text-center py-14" style={{ color: 'var(--cuidar-gris-suave)' }}>Buscando profesionales…</p>
        ) : results.length === 0 ? (
          <div className="text-center py-14" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Todavía no hay profesionales disponibles con estos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium px-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
              {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((pro) => {
              const style = getCatStyle(pro.categories)
              const saved = isSelected(pro.userId)
              return (
                <div key={pro.userId}
                  className={`bg-white p-5 border-2 ${style.border} flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-200`}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
                  {/* Photo SQUARE — brand rule: foto cuadrada, nunca circular */}
                  <div className="w-16 h-16 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--cuidar-borde)' }}>
                    {pro.photoUrl
                      ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" style={{ aspectRatio: '1/1' }} />
                      : <span className="font-heading font-bold text-2xl" style={{ color: 'var(--cuidar-verde-institucional)' }}>{pro.name?.[0]?.toUpperCase()}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Nombre + badges */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>{pro.name}</h3>
                      {pro.onDuty && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5"
                          style={{ background: '#dcfce7', color: '#14532d', border: '1px solid #86efac' }}>
                          <Zap className="w-3 h-3" /> Disponible Hoy
                        </span>
                      )}
                      {pro.verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5"
                          style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                          <ShieldCheck className="w-3 h-3" /> Documentación Verificada
                        </span>
                      )}
                    </div>

                    <StarRating rating={pro.rating ?? null} count={pro.reviewCount ?? 0} />

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold ${style.badge}`}>
                        <Tag className="w-3 h-3" />
                        {(pro.categories ?? []).map((c) => CAT_LABELS[c] ?? c).join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--cuidar-gris-medio)' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--cuidar-gris-suave)' }} />
                        {pro.distanceKm != null ? `${pro.distanceKm} km` : (ZONE_LABELS[pro.zone] ?? pro.zone)}
                      </span>
                      <span className="flex items-center gap-1 text-base font-bold" style={{ color: 'var(--cuidar-tinta)' }}>
                        <DollarSign className="w-4 h-4" style={{ color: 'var(--cuidar-verde-institucional)' }} />
                        ${Number(pro.hourlyRate).toLocaleString('es-AR')}
                        <span className="text-sm font-normal" style={{ color: 'var(--cuidar-gris-suave)' }}>/hr</span>
                      </span>
                    </div>

                    {subscribed && pro.officialRate != null && (
                      <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                        <Info className="w-3 h-3" />
                        Valor oficial de referencia: ${Number(pro.officialRate).toLocaleString('es-AR')}/hr
                      </p>
                    )}
                    {subscribed && pro.certifications?.length > 0 && (
                      <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>{pro.certifications.join(' · ')}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:items-stretch">
                    <button onClick={() => handlePreselect(pro)}
                      title={saved ? 'Quitar de preseleccionados' : 'Preseleccionar'}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm border-2 transition-all"
                      style={saved
                        ? { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)' }
                        : { borderColor: 'var(--cuidar-borde)', background: '#FFFFFF', color: 'var(--cuidar-gris-medio)' }}
                      onMouseEnter={e => { if (!saved) { e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'; e.currentTarget.style.color = 'var(--cuidar-verde-institucional)' } }}
                      onMouseLeave={e => { if (!saved) { e.currentTarget.style.borderColor = 'var(--cuidar-borde)'; e.currentTarget.style.color = 'var(--cuidar-gris-medio)' } }}>
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      {saved ? 'Guardado' : 'Preseleccionar'}
                    </button>

                    {subscribed ? (
                      onDutyOnly && pro.onDuty ? (
                        <button onClick={() => setGuardTarget(pro)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm text-white transition-colors"
                          style={{ background: '#16a34a' }}>
                          <Zap className="w-4 h-4" /> Solicitar Guardia
                        </button>
                      ) : (
                        <Link to="/dashboard"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm text-white transition-colors"
                          style={{ background: 'var(--cuidar-verde-institucional)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
                          Conectar
                        </Link>
                      )
                    ) : (
                      <Link to="/register?role=padre"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm text-white transition-colors"
                        style={{ background: 'var(--cuidar-verde-institucional)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
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
        <button onClick={() => setPublishOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 font-semibold text-sm text-white z-30 transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)', boxShadow: 'var(--cuidar-shadow-overlay)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Plus className="w-5 h-5" /> Publicar búsqueda
        </button>
      )}

      <PreselectionGuideToast
        visible={guideVisible}
        onDismiss={dismissGuide}
        onOpenDrawer={() => setDrawerOpen(true)}
      />
    </div>
  )
}

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
    <div className="border overflow-hidden" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left transition-colors"
        onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="flex items-center gap-2 font-heading font-bold" style={{ color: 'var(--cuidar-tinta)' }}>
          <Calculator className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
          ¿Necesitás más de un servicio a la vez?
        </span>
        <span className="text-xs font-semibold" style={{ color: 'var(--cuidar-verde-institucional)' }}>
          {open ? 'Cerrar' : 'Calcular tarifa combinada'}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 pt-4" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
          <p className="text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>
            Elegí los servicios que necesitás en simultáneo y te mostramos una referencia combinada según los valores oficiales.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.filter((c) => c.value).map((c) => {
              const style = CAT_STYLES[c.value]
              return (
                <button key={c.value} type="button" onClick={() => toggle(c.value)}
                  className={`px-3 py-2.5 border-2 text-xs font-semibold transition-all text-left ${style.border} ${
                    selected.includes(c.value) ? style.bg : ''
                  }`}
                  style={selected.includes(c.value)
                    ? { color: 'var(--cuidar-tinta)' }
                    : { background: '#FFFFFF', color: 'var(--cuidar-gris-medio)' }}>
                  {c.label}
                </button>
              )
            })}
          </div>

          {selected.length > 0 && (
            <div className="p-4 space-y-2" style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
              {configuredSelected.length > 0 && (
                <p className="text-sm" style={{ color: 'var(--cuidar-texto)' }}>
                  Referencia combinada estimada:{' '}
                  <strong className="text-base" style={{ color: 'var(--cuidar-verde-institucional)' }}>${suggestedTotal.toLocaleString('es-AR')}/hr</strong>
                  {' '}<span style={{ color: 'var(--cuidar-gris-suave)' }}>(± ${Number(tolerance).toLocaleString('es-AR')} de tolerancia)</span>
                </p>
              )}
              {missingSelected.length > 0 && (
                <p className="text-xs" style={{ color: '#92400e' }}>
                  Todavía no hay valor oficial cargado para: {missingSelected.map((v) => CAT_LABELS[v]).join(', ')}.
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cuidar-texto)' }}>Tu valor combinado (editable)</label>
                <div className="relative max-w-[12rem]">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                  <input type="number" min="0" step="100"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder={suggestedTotal ? String(suggestedTotal) : '0'}
                    className="w-full pl-9 pr-3 py-2 border text-sm outline-none"
                    style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
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
