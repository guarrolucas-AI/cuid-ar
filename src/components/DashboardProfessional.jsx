import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, ShieldX, ToggleLeft, ToggleRight, Save, User, Phone, MapPin, Tag, Bell, RefreshCw, Lock, CreditCard, MessageCircle, Camera, Zap, Briefcase, ChevronDown, ChevronUp, FileText, Award, PlusCircle, Trash2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ChatPanel from './ChatPanel'
import NotificationBell from './NotificationBell'
import AlertasConfig from './AlertasConfig'
import ProfileProgress from './ProfileProgress'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const ZONES      = ['CABA','GBA_Norte','GBA_Sur','GBA_Oeste']
const ZONE_LABELS = { CABA:'CABA', GBA_Norte:'GBA Norte', GBA_Sur:'GBA Sur', GBA_Oeste:'GBA Oeste' }
const CATEGORIES  = [
  { value:'infantil',    label:'Cuidado Infantil' },
  { value:'pedagogico',  label:'Apoyo Pedagógico' },
  { value:'salud',       label:'Salud Pediátrica' },
  { value:'terapeutico', label:'Cuidado Terapéutico' },
  { value:'limpieza',    label:'Limpieza del Hogar' },
]

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

function useToast() {
  const [toast, setToast] = useState(null)
  const show = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500) }
  return [toast, show]
}

export default function DashboardProfessional({ user, professional: init }) {
  const [pro,  setPro]  = useState(init)
  const [toast, notify] = useToast()
  const [openConversationId, setOpenConversationId] = useState(null)
  const [jobPosts, setJobPosts]   = useState([])
  const [jobsOpen, setJobsOpen]   = useState(false)
  const [dutyLoading, setDutyLoading] = useState(false)

  const profileRef = useRef(null)
  const rateRef    = useRef(null)

  const scrollTo = (section) => {
    if (section === 'profile') profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (section === 'rate')    rateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openJobsSection = () => {
    setJobsOpen(true)
    setTimeout(() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const patch = async (body) => {
    const res = await fetch(`${API_BASE}/api/professional/me`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  }

  const subscribed = user.status === 'subscribed'

  const toggleDuty = async () => {
    setDutyLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/professional/duty`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ onDuty: !pro.onDuty }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setPro((p) => ({ ...p, onDuty: data.onDuty }))
      notify(data.onDuty ? '¡Ahora estás De Guardia!' : 'Saliste del modo Guardia')
    } catch (e) {
      notify(e.message, false)
    }
    setDutyLoading(false)
  }

  const loadJobs = async () => {
    try {
      const zone = pro.zone ? `?zone=${pro.zone}` : ''
      const res = await fetch(`${API_BASE}/api/jobs${zone}`, { headers: authHeaders() })
      setJobPosts(await res.json())
    } catch {}
  }

  const applyToJob = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/apply`, {
        method: 'POST', headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) { notify(data.error, false); return }
      notify('Postulación enviada con éxito')
      setJobPosts((prev) => prev.map((j) => j.id === jobId ? { ...j, alreadyApplied: true } : j))
    } catch { notify('Error al postularse', false) }
  }

  useEffect(() => {
    if (jobsOpen && jobPosts.length === 0) loadJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsOpen])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 text-sm font-semibold text-white"
          style={{ background: toast.ok ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-coral-humano)', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="p-6 border flex items-center justify-between gap-4"
        style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        <div className="flex items-center gap-4">
          <PhotoUpload pro={pro} setPro={setPro} notify={notify} />
          <div>
            <h2 className="font-heading text-2xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>{pro.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(pro.categories ?? []).map((cat) => (
                <span key={cat} className="text-xs font-semibold px-3 py-1"
                  style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-borde)' }}>
                  {CATEGORIES.find(c => c.value === cat)?.label ?? cat}
                </span>
              ))}
              {subscribed
                ? <span className="text-xs font-semibold px-3 py-1 flex items-center gap-1"
                    style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)' }}>
                    <CreditCard className="w-3 h-3"/>Suscripción activa
                  </span>
                : <span className="text-xs font-semibold px-3 py-1 flex items-center gap-1"
                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                    <Lock className="w-3 h-3"/>Sin suscripción
                  </span>
              }
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {subscribed && <NotificationBell onViewJob={openJobsSection} />}
          {pro.verified
            ? <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                <ShieldCheck className="w-5 h-5" />Verificado
              </div>
            : <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '999px' }}>
                <ShieldX className="w-5 h-5" />Pendiente
              </div>
          }
        </div>
      </div>

      {/* Pantalla de pago si no tiene suscripción */}
      {!subscribed && <PaymentWall />}

      {/* Contenido solo para suscriptos */}
      {subscribed && (
        <>
          {/* Nivel de Perfil */}
          <ProfileProgress pro={pro} onScrollTo={scrollTo} />

          {/* Disponibilidad */}
          <div className="p-6 border" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--cuidar-tinta)' }}>Disponibilidad</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--cuidar-texto)' }}>
                  {pro.available ? 'Disponible para nuevas consultas' : 'No disponible en este momento'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                  {pro.available ? 'Aparecés en los resultados de búsqueda' : 'No aparecés en ninguna búsqueda'}
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const u = await patch({ available: !pro.available })
                    setPro(p => ({ ...p, available: u.available }))
                  } catch (e) { notify(e.message, false) }
                }}
                className="flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all flex-shrink-0"
                style={pro.available
                  ? { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }
                  : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
                {pro.available ? <><ToggleRight className="w-5 h-5"/>Activo</> : <><ToggleLeft className="w-5 h-5"/>Inactivo</>}
              </button>
            </div>

            {/* Toggle De Guardia */}
            <div className="mt-4 p-4 border-2 transition-all"
              style={{
                borderColor: pro.onDuty ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-borde)',
                background: pro.onDuty ? 'rgba(31,77,58,.05)' : 'var(--cuidar-nieve)',
              }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--cuidar-tinta)' }}>
                    <Zap className="w-4 h-4" style={{ color: pro.onDuty ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-gris-suave)' }} />
                    {pro.onDuty ? 'Estás De Guardia hoy' : 'Disponibilidad Inmediata / Guardia'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>
                    {pro.onDuty ? 'Las familias te ven como "Disponible Hoy" y pueden enviarte solicitudes urgentes' : 'Activalo si estás disponible para atender hoy con urgencia'}
                  </p>
                </div>
                <button
                  onClick={toggleDuty}
                  disabled={dutyLoading}
                  className="flex items-center gap-2 px-4 py-2.5 font-semibold text-sm transition-all flex-shrink-0 disabled:opacity-60"
                  style={pro.onDuty
                    ? { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }
                    : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
                  <Zap className="w-4 h-4" />
                  {dutyLoading ? '…' : pro.onDuty ? 'En Guardia' : 'Activar Guardia'}
                </button>
              </div>
            </div>
          </div>

          {/* Alertas de Trabajo */}
          <AlertasConfig />

          {/* Tablero de búsquedas activas */}
          <div id="jobs-section" className="border overflow-hidden" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
            <button
              onClick={() => setJobsOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 p-5 text-left transition-colors"
              style={{ color: 'var(--cuidar-tinta)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="flex items-center gap-2 font-heading font-bold">
                <Briefcase className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} />
                Búsquedas en tu zona
              </span>
              {jobsOpen
                ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--cuidar-gris-suave)' }} />
                : <ChevronDown className="w-5 h-5" style={{ color: 'var(--cuidar-gris-suave)' }} />}
            </button>

            {jobsOpen && (
              <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
                {jobPosts.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--cuidar-gris-suave)' }}>No hay búsquedas activas en tu zona por el momento.</p>
                ) : (
                  jobPosts.map((job) => (
                    <div key={job.id} className="border-2 p-4 space-y-2"
                      style={{ borderColor: 'var(--cuidar-verde-institucional)', background: 'rgba(31,77,58,.04)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>{job.categoryLabel}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>
                            {job.zone} · {job.schedule} · {job.modality}
                          </p>
                          {job.days?.length > 0 && (
                            <p className="text-xs mt-1" style={{ color: 'var(--cuidar-verde-institucional)' }}>{job.days.join(', ')}</p>
                          )}
                          {job.requirements?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {job.requirements.map((r) => (
                                <span key={r} className="text-xs px-2 py-0.5"
                                  style={{ background: '#FFFFFF', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>{r}</span>
                              ))}
                            </div>
                          )}
                          {job.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--cuidar-gris-suave)' }}>{job.notes}</p>}
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: 'var(--cuidar-gris-suave)' }}>{job.applicantCount} postulado{job.applicantCount !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => applyToJob(job.id)}
                        disabled={job.alreadyApplied}
                        className="w-full py-2 text-sm font-semibold transition-colors"
                        style={job.alreadyApplied
                          ? { background: 'rgba(31,77,58,.06)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', cursor: 'default' }
                          : { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }}>
                        {job.alreadyApplied ? '✓ Ya te postulaste' : 'Postularme'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Consultas recibidas */}
          <ContactRequests onOpenChat={setOpenConversationId} />

          {/* Mensajes */}
          <ChatPanel userId={user.id} openConversationId={openConversationId} onOpened={() => setOpenConversationId(null)} />

          {/* Mi perfil */}
          <div ref={profileRef}>
            <ProfileForm pro={pro} setPro={setPro} patch={patch} notify={notify} />
          </div>

          {/* Tarifa */}
          <div ref={rateRef}>
            <RateForm pro={pro} setPro={setPro} patch={patch} notify={notify} />
          </div>

          {/* Credenciales — solo visible si tiene categorías que las requieren */}
          {(pro.categories ?? []).some((c) => ['salud', 'terapeutico'].includes(c)) && (
            <CredentialsSection pro={pro} setPro={setPro} notify={notify} />
          )}
        </>
      )}
    </div>
  )
}

function PhotoUpload({ pro, setPro, notify }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetch(`${API_BASE}/api/professional/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPro((p) => ({ ...p, photoUrl: data.photoUrl }))
      notify('Foto de perfil actualizada')
    } catch (err) {
      notify(err.message, false)
    }
    setUploading(false)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className="relative w-16 h-16 overflow-hidden flex-shrink-0 group"
      style={{ background: 'var(--cuidar-nieve)', border: '2px solid var(--cuidar-borde)' }}
      title="Cambiar foto de perfil">
      {pro.photoUrl
        ? <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" style={{ aspectRatio: '1/1' }} />
        : <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--cuidar-gris-suave)' }}><User className="w-7 h-7" /></div>
      }
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.4)' }}>
        <Camera className="w-5 h-5 text-white" />
      </div>
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <RefreshCw className="w-5 h-5 text-white animate-spin" />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </button>
  )
}

function PaymentWall() {
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
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
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
    <div className="p-8 border text-center space-y-4"
      style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)', borderLeft: '3px solid var(--cuidar-coral-humano)' }}>
      <div className="w-14 h-14 flex items-center justify-center mx-auto"
        style={{ background: 'var(--cuidar-coral-soft)', border: '1px solid var(--cuidar-borde)' }}>
        <Lock className="w-7 h-7" style={{ color: 'var(--cuidar-coral-humano)' }} />
      </div>
      <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>Activá tu suscripción</h3>
      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--cuidar-gris-suave)' }}>
        Para recibir consultas de familias, aparecer en los resultados de búsqueda y acceder a todas las funciones, necesitás tener una suscripción activa.
      </p>
      <div className="p-4 text-sm space-y-1 text-left max-w-xs mx-auto"
        style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-coral-humano)' }}>✗ <span style={{ color: 'var(--cuidar-texto)' }}>Aparecés en búsquedas</span></p>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-coral-humano)' }}>✗ <span style={{ color: 'var(--cuidar-texto)' }}>Recibís consultas de familias</span></p>
        <p className="flex items-center gap-2" style={{ color: 'var(--cuidar-coral-humano)' }}>✗ <span style={{ color: 'var(--cuidar-texto)' }}>Editás tu perfil y tarifa</span></p>
      </div>
      {error && <p className="text-sm" style={{ color: 'var(--cuidar-coral-humano)' }}>{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={handleSubscribe} disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3 font-bold disabled:opacity-60 text-sm text-white transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <CreditCard className="w-4 h-4"/>
          {loading ? 'Redirigiendo…' : 'Suscribirme ahora'}
        </button>
        <button onClick={handleCheck} disabled={checking}
          className="inline-flex items-center gap-2 px-5 py-3 font-semibold disabled:opacity-60 text-sm transition-colors"
          style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--cuidar-nieve)'; e.currentTarget.style.borderColor = 'var(--cuidar-borde)' }}>
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`}/>
          {checking ? 'Verificando…' : 'Ya pagué → Verificar'}
        </button>
      </div>
    </div>
  )
}

const CAT_LABELS = { infantil:'Cuidado Infantil', pedagogico:'Apoyo Pedagógico', salud:'Salud Pediátrica', terapeutico:'Cuidado Terapéutico', limpieza:'Limpieza del Hogar' }

const PROVINCES = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']

function ContactRequests({ onOpenChat }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/professional/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => { setRequests(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 border" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <Bell className="w-4 h-4" style={{ color: 'var(--cuidar-verde-institucional)' }} />
        Consultas recibidas
        {requests.length > 0 && (
          <span className="ml-1 text-xs font-bold px-2 py-0.5 text-white"
            style={{ background: 'var(--cuidar-verde-institucional)', borderRadius: '999px' }}>{requests.length}</span>
        )}
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm py-4" style={{ color: 'var(--cuidar-gris-suave)' }}>
          <RefreshCw className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm py-4" style={{ color: 'var(--cuidar-gris-suave)' }}>Todavía no recibiste consultas de familias.</p>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ borderColor: 'var(--cuidar-borde)' }}>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>{req.parent.name}</span>
                  <span className="text-xs px-2 py-0.5 font-medium"
                    style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-borde)' }}>
                    {CAT_LABELS[req.category] ?? req.category}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>
                  {new Date(req.createdAt).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })}
                </p>
              </div>
              {req.conversationId && (
                <button onClick={() => onOpenChat(req.conversationId)}
                  className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 transition-colors"
                  style={{ color: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-700)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}>
                  <MessageCircle className="w-4 h-4"/>Ver conversación
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileForm({ pro, setPro, patch, notify }) {
  const [form, setForm] = useState({ name: pro.name, phone: pro.phone, zone: pro.zone, categories: pro.categories ?? [], bio: pro.bio ?? '' })
  const [saving, setSaving] = useState(false)
  const [catError, setCatError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleCategory = (value) => setForm(f => ({
    ...f,
    categories: f.categories.includes(value) ? f.categories.filter(c => c !== value) : [...f.categories, value],
  }))

  const inputStyle = { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }
  const inputClass = 'w-full px-4 py-3 border text-sm outline-none'

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.categories.length === 0) return setCatError('Elegí al menos una especialidad')
    setCatError('')
    setSaving(true)
    try {
      const u = await patch(form)
      setPro(p => ({ ...p, ...u }))
      notify('Perfil actualizado')
    } catch (err) { notify(err.message, false) }
    setSaving(false)
  }

  return (
    <div className="p-6 border" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold mb-5" style={{ color: 'var(--cuidar-tinta)' }}>Mi Perfil</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
              <User className="w-3.5 h-3.5"/>Nombre
            </label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputClass}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
              <Phone className="w-3.5 h-3.5"/>Teléfono
            </label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputClass}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
            <MapPin className="w-3.5 h-3.5"/>Zona
          </label>
          <select value={form.zone} onChange={e => set('zone', e.target.value)} required className={inputClass}
            style={{ ...inputStyle, background: '#FFFFFF' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
            {ZONES.map(z => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
            <Tag className="w-3.5 h-3.5"/>Especialidad(es)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(c => {
              const selected = form.categories.includes(c.value)
              return (
                <button key={c.value} type="button" onClick={() => toggleCategory(c.value)} aria-pressed={selected}
                  className="px-3 py-2 border-2 text-xs font-semibold transition-all"
                  style={selected
                    ? { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)' }
                    : { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-gris-medio)', background: '#FFFFFF' }}>
                  {c.label}
                </button>
              )
            })}
          </div>
          {catError && <p className="text-xs mt-1.5" style={{ color: 'var(--cuidar-coral-humano)' }}>{catError}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cuidar-texto)' }}>
            <FileText className="w-3.5 h-3.5"/>Biografía y experiencia
          </label>
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Contá tu experiencia, formación y lo que te diferencia como profesional…"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border text-sm outline-none resize-none"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>{form.bio.length}/500</p>
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

function RateForm({ pro, setPro, patch, notify }) {
  const [rate, setRate]     = useState(String(pro.hourlyRate))
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const u = await patch({ hourlyRate: parseFloat(rate) })
      setPro(p => ({ ...p, hourlyRate: u.hourlyRate }))
      notify('Tarifa actualizada')
    } catch (err) { notify(err.message, false) }
    setSaving(false)
  }

  return (
    <div className="p-6 border" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>Tarifa por hora</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--cuidar-gris-suave)' }}>
        Actual: <span className="font-semibold" style={{ color: 'var(--cuidar-verde-institucional)' }}>${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr</span>
      </p>
      <form onSubmit={handleSave} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>$</span>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} min="0" step="100" required
            className="w-full pl-8 pr-4 py-3 border text-sm font-semibold outline-none"
            style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-tinta)' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
          />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-3 font-semibold disabled:opacity-60 text-sm flex-shrink-0 text-white transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}

function CredentialsSection({ pro, setPro, notify }) {
  const [enabled, setEnabled] = useState(() => ({
    matricula_nacional:    (pro.credentials ?? []).some(c => c.type === 'matricula_nacional'),
    matricula_provincial:  (pro.credentials ?? []).some(c => c.type === 'matricula_provincial'),
  }))
  const [numbers, setNumbers] = useState(() => {
    const n = { matricula_nacional: '', matricula_provincial: '' }
    ;(pro.credentials ?? []).forEach(c => { n[c.type] = c.number ?? '' })
    return n
  })
  const [province, setProvince] = useState(() => {
    const p = (pro.credentials ?? []).find(c => c.type === 'matricula_provincial')
    return p?.province ?? ''
  })
  const [saving, setSaving] = useState(false)

  const CRED_TYPES = [
    { type: 'matricula_nacional', label: 'Matrícula Nacional' },
    { type: 'matricula_provincial', label: 'Matrícula Provincial' },
  ]

  const handleSave = async (e) => {
    e.preventDefault()
    const credentials = []
    if (enabled.matricula_nacional && numbers.matricula_nacional.trim())
      credentials.push({ type: 'matricula_nacional', number: numbers.matricula_nacional.trim() })
    if (enabled.matricula_provincial && numbers.matricula_provincial.trim())
      credentials.push({ type: 'matricula_provincial', number: numbers.matricula_provincial.trim(), province })
    if (credentials.length === 0) return notify('Ingresá al menos una matrícula', false)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/professional/credentials`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ credentials }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPro(p => ({ ...p, credentials: data }))
      notify('Matrículas guardadas')
    } catch (err) { notify(err.message, false) }
    setSaving(false)
  }

  return (
    <div className="p-6 border" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <h3 className="font-heading font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <Award className="w-4 h-4" style={{ color: 'var(--cuidar-verde-institucional)' }} />
        Matrícula Profesional
      </h3>
      <p className="text-xs mb-5" style={{ color: 'var(--cuidar-gris-suave)' }}>
        Requerida para Salud Pediátrica y Cuidado Terapéutico. El equipo de CuidAR 360 verifica los datos antes de mostrar el badge de credencial.
      </p>

      {(pro.credentials ?? []).length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(pro.credentials ?? []).map(c => {
            const verified = c.verifiedAt != null
            const typeLabel = c.type === 'matricula_nacional' ? 'Nacional' : 'Provincial'
            return (
              <span key={c.type} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1"
                style={verified
                  ? { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }
                  : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)', borderRadius: '999px' }}>
                {verified ? <CheckCircle className="w-3 h-3"/> : <Award className="w-3 h-3"/>}
                Matr. {typeLabel} · {verified ? 'Verificada' : 'Pendiente de verificación'}
              </span>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        {CRED_TYPES.map(({ type, label }) => (
          <div key={type} className="border" style={{ borderColor: 'var(--cuidar-borde)' }}>
            <button type="button" onClick={() => setEnabled(e => ({ ...e, [type]: !e[type] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
              style={enabled[type]
                ? { background: 'var(--cuidar-nieve)', borderBottom: '1px solid var(--cuidar-borde)' }
                : { background: '#FFFFFF' }}>
              <div className="w-4 h-4 border-2 flex items-center justify-center flex-shrink-0"
                style={enabled[type]
                  ? { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-verde-institucional)' }
                  : { borderColor: 'var(--cuidar-borde)' }}>
                {enabled[type] && <CheckCircle className="w-2.5 h-2.5 text-white"/>}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--cuidar-texto)' }}>{label}</span>
            </button>

            {enabled[type] && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cuidar-gris-medio)' }}>Número de matrícula</label>
                  <input value={numbers[type]} onChange={e => setNumbers(n => ({ ...n, [type]: e.target.value }))}
                    placeholder="ej: 12345"
                    className="w-full px-4 py-2.5 border text-sm outline-none"
                    style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-tinta)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
                  />
                </div>
                {type === 'matricula_provincial' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cuidar-gris-medio)' }}>Provincia</label>
                    <select value={province} onChange={e => setProvince(e.target.value)}
                      className="w-full px-4 py-2.5 border text-sm outline-none"
                      style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-tinta)', background: '#FFFFFF' }}
                      onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                      onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
                      <option value="">Seleccioná provincia</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 font-semibold disabled:opacity-60 text-sm text-white transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar matrículas'}
        </button>
      </form>
    </div>
  )
}
