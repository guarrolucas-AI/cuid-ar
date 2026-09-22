import { useState, useEffect } from 'react'
import {
  Settings, Users, ShieldCheck, ShieldX, ToggleLeft, ToggleRight,
  Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Lock,
  MapPin, Tag, Filter, DollarSign, Clock, History, ClipboardList, Award,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const CATEGORY_LABELS = {
  infantil: 'Cuidado Infantil',
  pedagogico: 'Apoyo Pedagógico',
  salud: 'Salud Pediátrica',
  terapeutico: 'Cuidado Terapéutico',
  limpieza: 'Limpieza del Hogar',
}

const inputCls = 'w-full px-4 py-3 border text-sm outline-none'

function StatCard({ label, value, sub }) {
  return (
    <div className="border p-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
      <div className="text-3xl font-heading font-bold" style={{ color: 'var(--cuidar-tinta)' }}>{value ?? '—'}</div>
      <div className="text-sm font-semibold mt-1" style={{ color: 'var(--cuidar-texto)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [config, setConfig]   = useState([])
  const [draft, setDraft]     = useState({})
  const [show, setShow]       = useState({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const notify = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/stats`,  { headers: headers() }).then((r) => r.json()),
      fetch(`${API_BASE}/api/admin/config`, { headers: headers() }).then((r) => r.json()),
    ]).then(([s, c]) => {
      setStats(s)
      setConfig(c)
      const initial = {}
      c.forEach((item) => { initial[item.key] = item.sensitive ? '' : item.value })
      setDraft(initial)
      setLoadingStats(false)
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== ''))
      const res = await fetch(`${API_BASE}/api/admin/config`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      notify('ok', 'Configuración guardada correctamente')
    } catch (err) { notify('err', err.message) }
    setSaving(false)
  }

  const mpEnabled = draft.mp_enabled === 'true'

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-64" style={{ color: 'var(--cuidar-gris-suave)' }}>
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando panel…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white"
          style={{ background: toast.type === 'ok' ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-coral-humano)', boxShadow: 'var(--cuidar-shadow-overlay)' }}>
          {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>Panel de Administración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>Configuración global de la plataforma CuidAR 360</p>
      </div>

      {/* Stats */}
      <section>
        <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
          <Users className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Estadísticas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Usuarios totales"           value={stats?.totalUsers}    />
          <StatCard label="Profesionales"              value={stats?.professionals} />
          <StatCard label="Familias registradas"       value={stats?.parents}       />
          <StatCard label="Profesionales verificados"  value={stats?.verified}
            sub={`${stats?.available ?? 0} disponibles hoy`} />
        </div>

        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div key={cat} className="border p-3 text-center" style={{ background: 'var(--cuidar-nieve)', borderColor: 'var(--cuidar-borde)' }}>
                <div className="font-bold text-lg" style={{ color: 'var(--cuidar-tinta)' }}>{count}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{CATEGORY_LABELS[cat] ?? cat}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Configuración MP */}
      <section>
        <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
          <Settings className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Configuración de Pagos (Mercado Pago)
        </h2>

        <form onSubmit={handleSave} className="border p-6 space-y-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>

          {/* Toggle MP habilitado */}
          <div className="flex items-center justify-between p-4" style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--cuidar-texto)' }}>Activar pagos con Mercado Pago</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>
                {mpEnabled
                  ? 'Los profesionales pueden suscribirse desde la plataforma'
                  : 'Los cobros están desactivados — completá el token antes de activar'}
              </p>
            </div>
            <button type="button"
              onClick={() => setDraft((d) => ({ ...d, mp_enabled: mpEnabled ? 'false' : 'true' }))}
              className="flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all"
              style={mpEnabled
                ? { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }
                : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
              {mpEnabled
                ? <><ToggleRight className="w-5 h-5" /> Activo</>
                : <><ToggleLeft  className="w-5 h-5" /> Inactivo</>}
            </button>
          </div>

          {config.map((item) => {
            if (item.key === 'mp_enabled') return null
            const isSensitive = item.sensitive
            const isVisible   = show[item.key]
            return (
              <div key={item.key}>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-texto)' }}>
                  {item.label}
                  {isSensitive && (
                    <span className="ml-2 text-xs font-normal px-2 py-0.5"
                      style={{ color: '#92400e', background: '#fffbeb', borderRadius: '999px' }}>
                      sensible
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={isSensitive && !isVisible ? 'password' : 'text'}
                    value={draft[item.key] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [item.key]: e.target.value }))}
                    placeholder={isSensitive ? 'Ingresá el nuevo valor para actualizar' : ''}
                    className={`${inputCls} pr-10`}
                    style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
                  />
                  {isSensitive && (
                    <button type="button"
                      onClick={() => setShow((s) => ({ ...s, [item.key]: !s[item.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--cuidar-gris-suave)' }}>
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-60 text-white transition-colors"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
              <Save className="w-4 h-4" />
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
            <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>Los campos sensibles vacíos no se sobreescriben</p>
          </div>
        </form>
      </section>

      <RatesSection notify={notify} />
      <ProfessionalsSection notify={notify} />
      <ParentsSection />
      <VerificacionesSection notify={notify} />
      <AuditLogSection />
      <ChangePasswordSection notify={notify} />
    </div>
  )
}

const ZONE_LABELS = { CABA:'CABA', GBA_Norte:'GBA Norte', GBA_Sur:'GBA Sur', GBA_Oeste:'GBA Oeste' }

function ProfessionalsSection({ notify }) {
  const [pros, setPros]       = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ category:'', zone:'', verified:'' })
  const [verifying, setVerifying]             = useState({})
  const [togglingSubscription, setTogglingSubscription] = useState({})

  const load = async (f = filters) => {
    setLoading(true)
    const params = new URLSearchParams(Object.fromEntries(Object.entries(f).filter(([,v]) => v !== '')))
    try {
      const res = await fetch(`${API_BASE}/api/admin/professionals?${params}`, { headers: headers() })
      setPros(await res.json())
    } catch { setPros([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const handleVerify = async (pro, verified) => {
    setVerifying(v => ({ ...v, [pro.userId]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/verify/${pro.userId}`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ verified }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setPros(ps => ps.map(p => p.userId === pro.userId ? { ...p, verified } : p))
      notify('ok', verified ? `${pro.name} verificado/a` : `${pro.name} desverificado/a`)
    } catch (err) { notify('err', err.message) }
    setVerifying(v => ({ ...v, [pro.userId]: false }))
  }

  const handleSubscription = async (pro, active) => {
    setTogglingSubscription(v => ({ ...v, [pro.userId]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscription/${pro.userId}`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setPros(ps => ps.map(p => p.userId === pro.userId
        ? { ...p, user: { ...p.user, status: active ? 'subscribed' : 'active' } } : p))
      notify('ok', active ? `Suscripción activada para ${pro.name}` : `Suscripción desactivada para ${pro.name}`)
    } catch (err) { notify('err', err.message) }
    setTogglingSubscription(v => ({ ...v, [pro.userId]: false }))
  }

  const selCls = 'pl-8 pr-3 py-2 border text-sm outline-none appearance-none'

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <ShieldCheck className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Profesionales
      </h2>

      <div className="border p-5 space-y-4" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        <div className="flex flex-wrap gap-3 items-end">
          {[
            { icon: Tag, value: filters.category, key: 'category', opts: [['','Todas las especialidades'], ...Object.entries(CATEGORY_LABELS)] },
            { icon: MapPin, value: filters.zone,     key: 'zone',     opts: [['','Todas las zonas'], ...Object.entries(ZONE_LABELS)] },
          ].map(({ icon: Icon, value, key, opts }) => (
            <div key={key} className="relative">
              <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }}/>
              <select value={value} onChange={e => setFilter(key, e.target.value)}
                className={selCls}
                style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
                onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div className="relative">
            <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--cuidar-gris-suave)' }}/>
            <select value={filters.verified} onChange={e => setFilter('verified', e.target.value)}
              className={selCls}
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
              <option value="">Todos</option>
              <option value="true">Solo verificados</option>
              <option value="false">Solo pendientes</option>
            </select>
          </div>
          <button onClick={() => load(filters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
            <Filter className="w-3.5 h-3.5"/> Filtrar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2"/> Cargando…
          </div>
        ) : pros.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>No hay profesionales con esos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-borde)' }}>
                  <th className="text-left py-2 pr-4 font-semibold">Nombre</th>
                  <th className="text-left py-2 pr-4 font-semibold">Email</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Especialidad</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden md:table-cell">Zona</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden md:table-cell">Tarifa/hr</th>
                  <th className="text-left py-2 pr-4 font-semibold">Verificación</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Suscripción</th>
                  <th className="py-2"/>
                </tr>
              </thead>
              <tbody>
                {pros.map(pro => (
                  <tr key={pro.userId} className="transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3 pr-4 font-medium" style={{ color: 'var(--cuidar-tinta)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{pro.name}</td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{pro.user?.email}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell" style={{ color: 'var(--cuidar-texto)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{(pro.categories ?? []).map(c => CATEGORY_LABELS[c] ?? c).join(', ')}</td>
                    <td className="py-3 pr-4 hidden md:table-cell" style={{ color: 'var(--cuidar-texto)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{ZONE_LABELS[pro.zone] ?? pro.zone}</td>
                    <td className="py-3 pr-4 font-semibold hidden md:table-cell" style={{ color: 'var(--cuidar-verde-institucional)', borderBottom: '1px solid var(--cuidar-nieve)' }}>${Number(pro.hourlyRate).toLocaleString('es-AR')}</td>
                    <td className="py-3 pr-4" style={{ borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      {pro.verified
                        ? <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 w-fit"
                            style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                            <ShieldCheck className="w-3 h-3"/>Verificado
                          </span>
                        : <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 w-fit"
                            style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '999px' }}>
                            <ShieldX className="w-3 h-3"/>Pendiente
                          </span>
                      }
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell" style={{ borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      {pro.user?.status === 'subscribed'
                        ? <span className="text-xs font-semibold px-2 py-1" style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>Activa</span>
                        : <span className="text-xs font-semibold px-2 py-1" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '999px' }}>Inactiva</span>
                      }
                    </td>
                    <td className="py-3" style={{ borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      <div className="flex flex-col gap-1.5">
                        <button disabled={verifying[pro.userId]}
                          onClick={() => handleVerify(pro, !pro.verified)}
                          className="text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                          style={pro.verified
                            ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                            : { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }}>
                          {verifying[pro.userId] ? '…' : pro.verified ? 'Quitar verificación' : 'Verificar'}
                        </button>
                        <button disabled={togglingSubscription[pro.userId]}
                          onClick={() => handleSubscription(pro, pro.user?.status !== 'subscribed')}
                          className="text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                          style={pro.user?.status === 'subscribed'
                            ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                            : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)' }}>
                          {togglingSubscription[pro.userId] ? '…' : pro.user?.status === 'subscribed' ? 'Desactivar suscripción' : 'Activar suscripción'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-3" style={{ color: 'var(--cuidar-gris-suave)' }}>{pros.length} profesional{pros.length !== 1 ? 'es' : ''}</p>
          </div>
        )}
      </div>
    </section>
  )
}

function RatesSection({ notify }) {
  const [rates, setRates]     = useState([])
  const [draft, setDraft]     = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [fetchingOfficial, setFetchingOfficial] = useState(false)

  const load = () => {
    fetch(`${API_BASE}/api/admin/rates`, { headers: headers() })
      .then((r) => r.json())
      .then((data) => {
        setRates(Array.isArray(data) ? data : [])
        const initial = {}
        ;(Array.isArray(data) ? data : []).forEach((r) => { initial[r.category] = r.officialRate ?? '' })
        setDraft(initial)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/rates`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      notify('ok', 'Aranceles actualizados correctamente')
      load()
    } catch (err) { notify('err', err.message) }
    setSaving(false)
  }

  const handleFetchOfficial = async () => {
    setFetchingOfficial(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/rates/fetch-official`, { method: 'POST', headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      notify('ok', `Aranceles de Casas Particulares actualizados (vigente ${data.vigencia})`)
      load()
    } catch (err) { notify('err', err.message) }
    setFetchingOfficial(false)
  }

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        {/* Agua clara es apropiada acá: sección de aranceles */}
        <DollarSign className="w-5 h-5" style={{ color: 'var(--cuidar-agua-clara)' }} /> Aranceles de Referencia
      </h2>
      <form onSubmit={handleSave} className="border p-6 space-y-4" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        <p className="text-xs -mt-1 mb-2" style={{ color: 'var(--cuidar-gris-suave)' }}>
          Valor oficial por hora, por categoría. Se muestra a los usuarios abonados junto a la tarifa que pretende
          cada profesional.
        </p>
        {/* Agua clara: encabezado de módulo de aranceles — único uso correcto */}
        <div className="flex items-center justify-between gap-3 p-4 flex-wrap"
          style={{ background: 'rgba(63,183,166,.08)', border: '1px solid rgba(63,183,166,0.3)' }}>
          <p className="text-xs" style={{ color: 'var(--cuidar-gris-medio)' }}>
            <strong style={{ color: 'var(--cuidar-tinta)' }}>Cuidado Infantil</strong> y <strong style={{ color: 'var(--cuidar-tinta)' }}>Limpieza del Hogar</strong> tienen
            fuente oficial única (ARCA). Las otras 3 categorías no tienen un nomenclador nacional unificado.
          </p>
          <button type="button" onClick={handleFetchOfficial} disabled={fetchingOfficial}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60 flex-shrink-0 whitespace-nowrap text-white transition-colors"
            style={{ background: 'var(--cuidar-agua-clara)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingOfficial ? 'animate-spin' : ''}`} />
            {fetchingOfficial ? 'Actualizando…' : 'Actualizar desde ARCA'}
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando…
          </div>
        ) : (
          <div className="space-y-3">
            {rates.map((r) => (
              <div key={r.category} className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                <label className="text-sm font-semibold w-40 flex-shrink-0" style={{ color: 'var(--cuidar-texto)' }}>
                  {CATEGORY_LABELS[r.category] ?? r.category}
                </label>
                <div className="relative flex-1 min-w-[10rem]">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                  <input type="number" min="0" step="100"
                    value={draft[r.category] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [r.category]: e.target.value }))}
                    placeholder="Sin configurar"
                    className="w-full pl-9 pr-3 py-2.5 border text-sm outline-none"
                    style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--cuidar-agua-clara)'}
                    onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
                  />
                </div>
                <span className="text-xs flex items-center gap-1 flex-shrink-0 w-56" style={{ color: 'var(--cuidar-gris-suave)' }}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {r.source ?? (r.officialRate != null ? 'Manual' : 'Sin configurar')}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="pt-2">
          <button type="submit" disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-60 text-white transition-colors"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar aranceles'}
          </button>
        </div>
      </form>
    </section>
  )
}

function ParentsSection() {
  const [parents, setParents]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState({})

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/parents`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setParents(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSubscription = async (p, active) => {
    setToggling(t => ({ ...t, [p.userId]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/subscription/${p.userId}`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setParents(ps => ps.map(x => x.userId === p.userId
        ? { ...x, user: { ...x.user, status: active ? 'subscribed' : 'active' } } : x))
    } catch {}
    setToggling(t => ({ ...t, [p.userId]: false }))
  }

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <Users className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Familias registradas
      </h2>
      <div className="border p-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando…
          </div>
        ) : parents.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>No hay familias registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-borde)' }}>
                  <th className="text-left py-2 pr-4 font-semibold">Nombre</th>
                  <th className="text-left py-2 pr-4 font-semibold">Email</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Teléfono</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden md:table-cell">Dirección</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Suscripción</th>
                  <th className="py-2"/>
                </tr>
              </thead>
              <tbody>
                {parents.map(p => (
                  <tr key={p.userId} className="transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3 pr-4 font-medium" style={{ color: 'var(--cuidar-tinta)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{p.name}</td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{p.user?.email}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell" style={{ color: 'var(--cuidar-texto)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{p.phone}</td>
                    <td className="py-3 pr-4 hidden md:table-cell" style={{ color: 'var(--cuidar-texto)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{p.address}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell" style={{ borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      {p.user?.status === 'subscribed'
                        ? <span className="text-xs font-semibold px-2 py-1" style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>Activa</span>
                        : <span className="text-xs font-semibold px-2 py-1" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '999px' }}>Inactiva</span>
                      }
                    </td>
                    <td className="py-3" style={{ borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      <button disabled={toggling[p.userId]}
                        onClick={() => handleSubscription(p, p.user?.status !== 'subscribed')}
                        className="text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
                        style={p.user?.status === 'subscribed'
                          ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                          : { background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)' }}>
                        {toggling[p.userId] ? '…' : p.user?.status === 'subscribed' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-3" style={{ color: 'var(--cuidar-gris-suave)' }}>{parents.length} familia{parents.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </section>
  )
}

const AUDIT_ACTION_LABELS = {
  'config.update': 'Actualizó configuración',
  'rates.update': 'Actualizó aranceles',
  'rates.fetch-official': 'Actualizó aranceles desde ARCA',
  'rates.auto-fetch': 'Aranceles actualizados automáticamente (cron)',
  'professional.verify': 'Verificó profesional',
  'professional.unverify': 'Quitó verificación',
  'subscription.activate': 'Activó suscripción',
  'subscription.deactivate': 'Desactivó suscripción',
  'identity.clear': 'Antecedentes aprobados',
  'identity.flagged': 'Antecedentes observados',
  'identity.pending': 'Antecedentes marcados pendientes',
  'identity.manual_review': 'Marcado para revisión manual',
  'credential.verify': 'Matrícula verificada',
  'credential.unverify': 'Verificación de matrícula retirada',
}

const CHECK_STATUS = {
  pending:       { label: 'Pendiente',      color: '#92400e',                             bg: '#fffbeb',              border: '#fcd34d' },
  clear:         { label: 'Aprobado',       color: 'var(--cuidar-verde-institucional)',    bg: 'var(--cuidar-nieve)',  border: 'var(--cuidar-verde-institucional)' },
  flagged:       { label: 'Observado',      color: '#dc2626',                             bg: '#fef2f2',              border: '#fca5a5' },
  manual_review: { label: 'Rev. manual',    color: '#6d28d9',                             bg: '#f5f3ff',              border: '#a78bfa' },
}

function VerificacionesSection({ notify }) {
  const [checks, setChecks]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [saving, setSaving]     = useState({})

  const load = (filter = statusFilter) => {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    fetch(`${API_BASE}/api/admin/identity-checks${params}`, { headers: headers() })
      .then(r => r.json())
      .then(data => { setChecks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (userId, status, notes) => {
    setSaving(s => ({ ...s, [userId]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/identity-checks/${userId}`, {
        method: 'PATCH', headers: headers(), body: JSON.stringify({ status, notes }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setChecks(cs => cs.map(c => c.userId === userId ? { ...c, status, notes } : c))
      notify('ok', 'Verificación actualizada')
    } catch (err) { notify('err', err.message) }
    setSaving(s => ({ ...s, [userId]: false }))
  }

  const handleCredVerify = async (credentialId, verified, userId) => {
    const key = `cred_${credentialId}`
    setSaving(s => ({ ...s, [key]: true }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/credentials/${credentialId}/verify`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ verified }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setChecks(cs => cs.map(c => {
        if (c.userId !== userId) return c
        const creds = (c.user?.professional?.credentials ?? []).map(cr =>
          cr.id === credentialId ? { ...cr, verifiedAt: verified ? new Date().toISOString() : null } : cr
        )
        return { ...c, user: { ...c.user, professional: { ...c.user.professional, credentials: creds } } }
      }))
      notify('ok', verified ? 'Matrícula verificada' : 'Verificación retirada')
    } catch (err) { notify('err', err.message) }
    setSaving(s => ({ ...s, [key]: false }))
  }

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <ClipboardList className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Verificaciones de Identidad
      </h2>
      <div className="border p-5 space-y-4" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        <div className="flex gap-3 items-end flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border text-sm outline-none"
            style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="clear">Aprobados</option>
            <option value="flagged">Observados</option>
            <option value="manual_review">Revisión manual</option>
          </select>
          <button onClick={() => load(statusFilter)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--cuidar-verde-institucional)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
            <Filter className="w-3.5 h-3.5"/> Filtrar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2"/> Cargando…
          </div>
        ) : checks.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>No hay verificaciones con ese filtro.</p>
        ) : (
          <div className="space-y-4">
            {checks.map(check => (
              <VerificationCard key={check.userId} check={check} saving={saving}
                onStatusChange={handleStatusChange} onCredVerify={handleCredVerify} />
            ))}
            <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{checks.length} verificación{checks.length !== 1 ? 'es' : ''}</p>
          </div>
        )}
      </div>
    </section>
  )
}

function VerificationCard({ check, saving, onStatusChange, onCredVerify }) {
  const [status, setStatus] = useState(check.status)
  const [notes, setNotes]   = useState(check.notes ?? '')

  const pro = check.user?.professional
  const st  = CHECK_STATUS[check.status] ?? CHECK_STATUS.pending

  return (
    <div className="border p-5 space-y-4" style={{ borderColor: 'var(--cuidar-borde)' }}>
      {/* Cabecera */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--cuidar-tinta)' }}>
            {pro?.name ?? check.user?.email}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--cuidar-gris-suave)' }}>{check.user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-0.5"
              style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-gris-medio)' }}>
              DNI: {check.user?.dni ?? '—'}
            </span>
            <span className="text-xs px-2 py-0.5"
              style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-gris-medio)' }}>
              CUIL: {check.user?.cuil ?? '—'}
            </span>
            {(pro?.categories ?? []).length > 0 && (
              <span className="text-xs px-2 py-0.5"
                style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)', color: 'var(--cuidar-gris-medio)' }}>
                {pro.categories.map(c => CATEGORY_LABELS[c] ?? c).join(', ')}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 flex-shrink-0"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: '999px' }}>
          {st.label}
        </span>
      </div>

      {/* Matrículas profesionales */}
      {(pro?.credentials ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--cuidar-gris-medio)' }}>MATRÍCULAS</p>
          {pro.credentials.map(cr => {
            const credVerified = cr.verifiedAt != null
            const typeLabel = cr.type === 'matricula_nacional' ? 'Nacional' : 'Provincial'
            return (
              <div key={cr.id} className="flex items-center gap-3 flex-wrap p-3"
                style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                <Award className="w-3.5 h-3.5 flex-shrink-0" style={{ color: credVerified ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-gris-suave)' }}/>
                <span className="flex-1 text-xs font-semibold min-w-0" style={{ color: 'var(--cuidar-texto)' }}>
                  Matr. {typeLabel}: {cr.number}
                  {cr.province && <span className="font-normal ml-1" style={{ color: 'var(--cuidar-gris-suave)' }}>— {cr.province}</span>}
                </span>
                {credVerified && (
                  <span className="text-xs px-2 py-0.5 flex-shrink-0"
                    style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)', border: '1px solid var(--cuidar-verde-institucional)', borderRadius: '999px' }}>
                    Verificada
                  </span>
                )}
                <button disabled={saving[`cred_${cr.id}`]}
                  onClick={() => onCredVerify(cr.id, !credVerified, check.userId)}
                  className="text-xs font-semibold px-3 py-1 transition-colors disabled:opacity-50 flex-shrink-0"
                  style={credVerified
                    ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }
                    : { background: 'var(--cuidar-verde-institucional)', color: '#FFFFFF' }}>
                  {saving[`cred_${cr.id}`] ? '…' : credVerified ? 'Quitar verificación' : 'Verificar'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Actualizar estado de antecedentes */}
      <div className="flex flex-wrap gap-3 items-end pt-1" style={{ borderTop: '1px solid var(--cuidar-nieve)' }}>
        <div className="flex-1 min-w-[12rem]">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cuidar-gris-medio)' }}>Estado antecedentes</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 border text-sm outline-none"
            style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}>
            <option value="pending">Pendiente</option>
            <option value="clear">Aprobado</option>
            <option value="flagged">Observado</option>
            <option value="manual_review">Revisión manual</option>
          </select>
        </div>
        <div className="flex-[2] min-w-[12rem]">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--cuidar-gris-medio)' }}>Notas internas</label>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="ej: verificado con RENAPER el 2026-09-21"
            className="w-full px-3 py-2.5 border text-sm outline-none"
            style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
            onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
            onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
          />
        </div>
        <button disabled={saving[check.userId]}
          onClick={() => onStatusChange(check.userId, status, notes)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-60 text-white transition-colors flex-shrink-0"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Save className="w-4 h-4"/>{saving[check.userId] ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

function AuditLogSection() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/audit`, { headers: headers() })
      .then((r) => r.json())
      .then((data) => { setLogs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <History className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Auditoría
      </h2>
      <div className="border p-5" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10" style={{ color: 'var(--cuidar-gris-suave)' }}>
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando…
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--cuidar-gris-suave)' }}>Todavía no hay acciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-borde)' }}>
                  <th className="text-left py-2 pr-4 font-semibold">Fecha</th>
                  <th className="text-left py-2 pr-4 font-semibold">Admin</th>
                  <th className="text-left py-2 pr-4 font-semibold">Acción</th>
                  <th className="text-left py-2 pr-4 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-nieve)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="py-3 pr-4 text-xs whitespace-nowrap" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-nieve)' }}>
                      {new Date(log.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--cuidar-gris-medio)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{log.adminEmail}</td>
                    <td className="py-3 pr-4 font-medium" style={{ color: 'var(--cuidar-tinta)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{AUDIT_ACTION_LABELS[log.action] ?? log.action}</td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--cuidar-gris-suave)', borderBottom: '1px solid var(--cuidar-nieve)' }}>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs mt-3" style={{ color: 'var(--cuidar-gris-suave)' }}>Últimas {logs.length} acciones</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ChangePasswordSection({ notify }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [show, setShow]     = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return notify('err', 'Las contraseñas nuevas no coinciden')
    if (form.newPassword.length < 6)       return notify('err', 'Mínimo 6 caracteres')
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/account/password`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      notify('ok', 'Contraseña actualizada correctamente')
    } catch (err) { notify('err', err.message) }
    setSaving(false)
  }

  return (
    <section>
      <h2 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--cuidar-tinta)' }}>
        <Lock className="w-5 h-5" style={{ color: 'var(--cuidar-verde-institucional)' }} /> Cambiar Contraseña
      </h2>
      <form onSubmit={handleSubmit} className="border p-6 space-y-4 max-w-md" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-texto)' }}>Contraseña actual</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} required
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              placeholder="Tu contraseña actual"
              className="w-full px-4 py-3 pr-10 border text-sm outline-none"
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--cuidar-gris-suave)' }}>
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {[
          { key: 'newPassword', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres', min: 6 },
          { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Repetí la nueva contraseña' },
        ].map(({ key, label, placeholder, min }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-texto)' }}>{label}</label>
            <input type="password" required minLength={min}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border text-sm outline-none"
              style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
              onFocus={e => e.target.style.borderColor = 'var(--cuidar-verde-institucional)'}
              onBlur={e => e.target.style.borderColor = 'var(--cuidar-borde)'}
            />
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 font-semibold disabled:opacity-60 text-white transition-colors"
          style={{ background: 'var(--cuidar-verde-institucional)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--cuidar-verde-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--cuidar-verde-institucional)'}>
          <Save className="w-4 h-4" />
          {saving ? 'Guardando…' : 'Actualizar contraseña'}
        </button>
      </form>
    </section>
  )
}
