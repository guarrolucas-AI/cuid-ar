import { useState, useEffect } from 'react'
import { Search, MapPin, Tag, DollarSign, Bell, CheckCircle, ShieldCheck, Save, User, Phone, Lock, CreditCard, RefreshCw, Briefcase, Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ChatPanel from './ChatPanel'
import PublishJobModal from './PublishJobModal'
import { CAT_STYLES } from '../lib/categoryStyles'
import IdentityBanner from './IdentityBanner'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const CATEGORIES = [
  { value:'',           label:'Todas las categorías' },
  { value:'infantil',   label:'Cuidado Infantil' },
  { value:'pedagogico', label:'Apoyo Pedagógico' },
  { value:'salud',      label:'Salud Pediátrica' },
  { value:'terapeutico',label:'Cuidado Terapéutico' },
  { value:'limpieza',   label:'Limpieza del Hogar' },
]
const ZONES = [
  { value:'',          label:'Todas las zonas' },
  { value:'CABA',      label:'CABA' },
  { value:'GBA_Norte', label:'GBA Norte' },
  { value:'GBA_Sur',   label:'GBA Sur' },
  { value:'GBA_Oeste', label:'GBA Oeste' },
]
const MAX_RATES = [
  { value:'',      label:'Cualquier tarifa' },
  { value:'5300',  label:'Hasta $5.300/hr' },
  { value:'6000',  label:'Hasta $6.000/hr' },
  { value:'8500',  label:'Hasta $8.500/hr' },
  { value:'11000', label:'Hasta $11.000/hr' },
]

const CAT_LABELS  = Object.fromEntries(CATEGORIES.filter(c => c.value).map(c => [c.value, c.label]))
const ZONE_LABELS = Object.fromEntries(ZONES.filter(z => z.value).map(z => [z.value, z.label]))

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const inputCls = 'w-full px-4 py-3 border text-sm outline-none'
const selectCls = 'w-full pl-9 pr-3 py-3 border text-sm outline-none appearance-none'

function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500) }
  return [toast, show]
}

export default function DashboardParent({ user, profile: init }) {
  const [filters,  setFilters]  = useState({ category:'', zone:'', maxRate:'' })
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [notified, setNotified] = useState({})
  const [toast,    notify]      = useToast()
  const [openConversationId, setOpenConversationId] = useState(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [myJobs, setMyJobs]           = useState([])
  const [jobsOpen, setJobsOpen]       = useState(false)

  const loadMyJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/mine`, { headers: authHeaders() })
      setMyJobs(await res.json())
    } catch {}
  }

  const toggleJobStatus = async (id, current) => {
    const next = current === 'active' ? 'closed' : 'active'
    try {
      await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status: next }),
      })
      setMyJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: next } : j))
      notify(next === 'active' ? 'Búsqueda activada' : 'Búsqueda cerrada')
    } catch { notify('Error al actualizar', false) }
  }

  useEffect(() => {
    if (jobsOpen && myJobs.length === 0) loadMyJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsOpen])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const handleSearch = async () => {
    setLoading(true); setSearched(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)))
    try {
      const res = await fetch(`${API_BASE}/api/match/search?${params}`, { headers: authHeaders() })
      setResults(await res.json())
    } catch { setResults([]) }
    setLoading(false)
  }

  const handleNotify = async (pro) => {
    const category = filters.category || pro.categories?.[0]
    try {
      const res = await fetch(`${API_BASE}/api/match/notify`, {
        method:'POST', headers: authHeaders(),
        body: JSON.stringify({ professionalId: pro.userId, category }),
      })
      const data = await res.json()
      setNotified(p => ({ ...p, [pro.userId]: true }))
      notify('Notificación enviada. Ya podés escribirle por el chat')
      if (data.conversationId) setOpenConversationId(data.conversationId)
    } catch { notify('Error al enviar la notificación', false) }
  }

  const subscribed = user.status === 'subscribed'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 text-sm font-semibold text-white"
          style={{ background: toast.ok ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-coral-humano)', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>{init?.name ?? user.email}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{user.email}</p>
        </div>
        {subscribed
          ? <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5"
              style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
              <CreditCard className="w-3.5 h-3.5"/>Suscripción activa
            </span>
          : <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '999px' }}>
              <Lock className="w-3.5 h-3.5"/>Sin suscripción
            </span>
        }
      </div>

      {/* Banner de verificación de identidad */}
      <IdentityBanner notify={notify} />

      {!subscribed && <ParentPaymentWall />}

      {subscribed && (
        <>
          <ProfileForm user={user} init={init} notify={notify} />

          {/* Buscador */}
          <div className="border p-6" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
            <h2 className="font-heading text-xl font-bold mb-5" style={{ color: 'var(--cuidar-tinta)' }}>Buscar profesional</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }}/>
                <select value={filters.category} onChange={e => setFilter('category', e.target.value)}
                  className={selectCls}
                  style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                  onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                  onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }}/>
                <select value={filters.zone} onChange={e => setFilter('zone', e.target.value)}
                  className={selectCls}
                  style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                  onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                  onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
                  {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
                </select>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }}/>
                <select value={filters.maxRate} onChange={e => setFilter('maxRate', e.target.value)}
                  className={selectCls}
                  style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                  onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                  onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
                  {MAX_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleSearch} disabled={loading}
              className="flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-60 w-full sm:w-auto justify-center text-white transition-colors"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
              <Search className="w-4 h-4"/>{loading ? 'Buscando…' : 'Buscar profesionales'}
            </button>
          </div>

          {/* Resultados vacíos */}
          {searched && !loading && results.length === 0 && (
            <div className="text-center py-14" style={{ color: 'var(--cuidar-gris-suave)' }}>
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30"/>
              <p className="text-sm font-medium">No encontramos profesionales con esos filtros.</p>
              <p className="text-xs mt-1">Probá ampliando la zona o el presupuesto.</p>
            </div>
          )}

          {/* Cards de resultados */}
          {results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium px-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
              </p>
              {results.map(pro => (
                <div key={pro.userId} className="border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
                  {/* Foto cuadrada — esquina viva (brand manual: nunca circular) */}
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                    {pro.photoUrl
                      ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />
                      : <span className="font-heading font-bold text-lg" style={{ color: 'var(--cuidar-verde-institucional)' }}>{pro.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-heading font-bold" style={{ color: 'var(--cuidar-tinta)' }}>{pro.name}</h3>
                      {pro.verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5"
                          style={{ background: 'var(--cuidar-agua-soft)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                          <ShieldCheck className="w-3 h-3"/>Verificado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--cuidar-gris-medio)' }}>
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/>{(pro.categories ?? []).map(c => CAT_LABELS[c] ?? c).join(', ')}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{ZONE_LABELS[pro.zone] ?? pro.zone}</span>
                      <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--cuidar-verde-institucional)' }}>
                        <DollarSign className="w-3.5 h-3.5"/>${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                      </span>
                    </div>
                    {pro.officialRate != null && (
                      <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                        Valor oficial de referencia: ${Number(pro.officialRate).toLocaleString('es-AR')}/hr
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleNotify(pro)} disabled={notified[pro.userId]}
                    className="flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all flex-shrink-0"
                    style={notified[pro.userId]
                      ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', cursor: 'default' }
                      : { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }}
                    onMouseEnter={e => { if (!notified[pro.userId]) e.currentTarget.style.background = 'var(--cuidar-verde-700)' }}
                    onMouseLeave={e => { if (!notified[pro.userId]) e.currentTarget.style.background = 'var(--cuidar-verde-institucional)' }}>
                    {notified[pro.userId]
                      ? <><CheckCircle className="w-4 h-4"/>Notificado</>
                      : <><Bell className="w-4 h-4"/>Contactar y Notificar</>}
                  </button>
                </div>
              ))}
            </div>
          )}

          <ChatPanel userId={user.id} openConversationId={openConversationId} onOpened={() => setOpenConversationId(null)} />

          {/* Mis Búsquedas */}
          <div className="border overflow-hidden" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
            <div className="flex items-center justify-between gap-3 p-5" style={{ borderBottom: '1px solid var(--cuidar-borde)' }}>
              <button onClick={() => setJobsOpen((v) => !v)}
                className="flex items-center gap-2 font-heading font-bold transition-colors"
                style={{ color: 'var(--cuidar-tinta)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-tinta)'}>
                <Briefcase className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
                Mis Búsquedas
                {jobsOpen ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />}
              </button>
              <button onClick={() => setPublishOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 font-semibold text-sm text-white transition-colors"
                style={{ background: 'var(--cuidar-verde-institucional)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
                <Plus className="w-4 h-4" /> Publicar búsqueda
              </button>
            </div>

            {jobsOpen && (
              <div className="p-4 space-y-3">
                {myJobs.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--cuidar-gris-suave)' }}>Todavía no publicaste ninguna búsqueda.</p>
                ) : (
                  myJobs.map((job) => (
                    <div key={job.id} className="border-2 p-4 space-y-3"
                      style={{ borderColor: 'var(--cuidar-borde)', background: 'var(--cuidar-nieve)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-heading font-bold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>{job.categoryLabel}</p>
                            <span className="text-xs font-semibold px-2 py-0.5"
                              style={job.status === 'active'
                                ? { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: '999px' }
                                : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-suave)', border: '1px solid var(--cuidar-borde)', borderRadius: '999px' }}>
                              {job.status === 'active' ? 'Activa' : 'Cerrada'}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{job.zone} · {job.schedule} · {job.modality}</p>
                          {job.days?.length > 0 && <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-verde-institucional)' }}>{job.days.join(', ')}</p>}
                          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--cuidar-gris-medio)' }}>{job.applicantCount} postulado{job.applicantCount !== 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={() => toggleJobStatus(job.id, job.status)}
                          className="text-xs font-semibold flex-shrink-0 p-1 transition-colors"
                          style={{ color: 'var(--cuidar-gris-suave)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}
                          title={job.status === 'active' ? 'Cerrar búsqueda' : 'Reactivar'}>
                          {job.status === 'active' ? <X className="w-4 h-4" /> : '↺'}
                        </button>
                      </div>

                      {job.applicants?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold" style={{ color: 'var(--cuidar-gris-medio)' }}>Profesionales postulados:</p>
                          {job.applicants.map((a) => (
                            <div key={a.applicationId} className="flex items-center gap-2 border p-2.5"
                              style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
                              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                                {a.photoUrl
                                  ? <img src={a.photoUrl} alt={a.name} className="w-full h-full object-cover" />
                                  : <span className="font-bold text-xs" style={{ color: 'var(--cuidar-verde-institucional)' }}>{a.name?.[0]?.toUpperCase()}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>{a.name}</p>
                                <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>${Number(a.hourlyRate).toLocaleString('es-AR')}/hr</p>
                              </div>
                              {a.verified && <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cuidar-verde-institucional)' }} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {publishOpen && (
        <PublishJobModal
          onClose={() => setPublishOpen(false)}
          onSuccess={() => {
            setPublishOpen(false)
            notify('Búsqueda publicada con éxito')
            loadMyJobs()
            if (!jobsOpen) setJobsOpen(true)
          }}
        />
      )}
    </div>
  )
}

function ParentPaymentWall() {
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError]       = useState('')
  const { refreshUser }         = useAuth()

  const handleSubscribe = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/api/checkout/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.init_point
    } catch (err) { setError(err.message); setLoading(false) }
  }

  const handleCheck = async () => {
    setChecking(true)
    try {
      const res = await fetch(`${API_BASE}/api/checkout/verify`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (data.status === 'subscribed') await refreshUser()
      else setError('Tu pago aún no fue confirmado por Mercado Pago. Esperá unos minutos e intentá de nuevo.')
    } catch { setError('Error al verificar. Intentá de nuevo.') }
    setChecking(false)
  }

  return (
    <div className="border p-8 text-center space-y-4" style={{ background: '#FFFFFF', borderColor: '#fca5a5' }}>
      <div className="w-14 h-14 flex items-center justify-center mx-auto" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
        <Lock className="w-7 h-7" style={{ color: '#dc2626' }} />
      </div>
      <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>Activá tu suscripción</h3>
      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--cuidar-gris-medio)' }}>
        Para buscar profesionales y contactarlos necesitás tener una suscripción activa.
      </p>
      <div className="p-4 text-sm space-y-1 text-left max-w-xs mx-auto" style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-gris-medio)' }}><span style={{ color: '#dc2626' }}>✗</span> Buscar profesionales</p>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-gris-medio)' }}><span style={{ color: '#dc2626' }}>✗</span> Contactar y notificar</p>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-gris-medio)' }}><span style={{ color: '#dc2626' }}>✗</span> Ver perfiles verificados</p>
      </div>
      {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={handleSubscribe} disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3 font-bold disabled:opacity-60 text-sm text-white"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <CreditCard className="w-4 h-4"/>
          {loading ? 'Redirigiendo…' : 'Suscribirme ahora'}
        </button>
        <button onClick={handleCheck} disabled={checking}
          className="inline-flex items-center gap-2 px-5 py-3 font-semibold disabled:opacity-60 text-sm transition-colors"
          style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-borde)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}>
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}/>
          {checking ? 'Verificando…' : 'Ya pagué → Verificar'}
        </button>
      </div>
    </div>
  )
}

function ProfileForm({ user, init, notify }) {
  const [form, setForm]   = useState({ name: init?.name || '', phone: init?.phone || '', address: init?.address || '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await fetch(`${API_BASE}/api/parent/me`, {
        method:'PATCH', headers: authHeaders(), body: JSON.stringify(form),
      })
      notify('Perfil actualizado')
    } catch { notify('Error al guardar', false) }
    setSaving(false)
  }

  return (
    <div className="border p-6" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold mb-5" style={{ color: 'var(--cuidar-tinta)' }}>Mi Perfil</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
              <User className="w-3.5 h-3.5"/>Nombre
            </label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className={inputCls}
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}/>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
              <Phone className="w-3.5 h-3.5"/>Teléfono
            </label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} required
              className={inputCls}
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
            <MapPin className="w-3.5 h-3.5"/>Dirección o barrio
          </label>
          <input value={form.address} onChange={e => set('address', e.target.value)} required
            placeholder="Ej: Palermo, CABA"
            className={inputCls}
            style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}/>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 font-semibold disabled:opacity-60 text-sm text-white transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
