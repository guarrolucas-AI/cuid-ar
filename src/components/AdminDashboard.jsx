import { useState, useEffect, useCallback } from 'react'
import {
  Settings, Users, ShieldCheck, ShieldX, ToggleLeft, ToggleRight,
  Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Lock,
  MapPin, Tag, Phone, Filter,
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

// ── Subcomponente: tarjeta de estadística ──────────────────────────────────
function StatCard({ label, value, sub, color = 'teal' }) {
  const colors = {
    teal:    'bg-teal-50  text-teal-600  border-teal-100',
    blue:    'bg-blue-50  text-blue-600  border-blue-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="text-3xl font-heading font-bold">{value ?? '—'}</div>
      <div className="text-sm font-semibold mt-1">{label}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Panel principal ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [config, setConfig]   = useState([])
  const [draft, setDraft]     = useState({})
  const [show, setShow]       = useState({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)   // { type: 'ok'|'err', msg }
  const [loadingStats, setLoadingStats] = useState(true)

  const notify = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/admin/stats`,  { headers: headers() }).then((r) => r.json()),
      fetch(`${API_BASE}/api/admin/config`, { headers: headers() }).then((r) => r.json()),
    ]).then(([s, c]) => {
      setStats(s)
      setConfig(c)
      // draft parte del valor real (campos sensibles quedan vacíos para re-ingresar)
      const initial = {}
      c.forEach((item) => { initial[item.key] = item.sensitive ? '' : item.value })
      setDraft(initial)
      setLoadingStats(false)
    })
  }, [])

  // ── Guardar config ─────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Solo envía los keys que tienen valor (evita pisar sensibles con string vacío)
      const payload = Object.fromEntries(
        Object.entries(draft).filter(([, v]) => v !== '')
      )
      const res = await fetch(`${API_BASE}/api/admin/config`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      notify('ok', 'Configuración guardada correctamente')
    } catch (err) {
      notify('err', err.message)
    }
    setSaving(false)
  }

  const mpEnabled = draft.mp_enabled === 'true'

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-64 text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando panel…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === 'ok' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-sm text-gray-500 mt-1">Configuración global de la plataforma CUID_AR</p>
      </div>

      {/* Stats */}
      <section>
        <h2 className="font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-500" /> Estadísticas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Usuarios totales"         value={stats?.totalUsers}    color="teal"    />
          <StatCard label="Profesionales"            value={stats?.professionals} color="blue"    />
          <StatCard label="Familias registradas"     value={stats?.parents}       color="amber"   />
          <StatCard label="Profesionales verificados" value={stats?.verified}
            sub={`${stats?.available ?? 0} disponibles hoy`}                      color="emerald" />
        </div>

        {/* Por categoría */}
        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div key={cat} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <div className="font-bold text-lg text-gray-800">{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{CATEGORY_LABELS[cat] ?? cat}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Configuración MP */}
      <section>
        <h2 className="font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-500" /> Configuración de Pagos (Mercado Pago)
        </h2>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Toggle MP habilitado */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-700">Activar pagos con Mercado Pago</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {mpEnabled
                  ? 'Los profesionales pueden suscribirse desde la plataforma'
                  : 'Los cobros están desactivados — completá el token antes de activar'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, mp_enabled: mpEnabled ? 'false' : 'true' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                mpEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {mpEnabled
                ? <><ToggleRight className="w-5 h-5" /> Activo</>
                : <><ToggleLeft  className="w-5 h-5" /> Inactivo</>}
            </button>
          </div>

          {/* Campos de configuración */}
          {config.map((item) => {
            if (item.key === 'mp_enabled') return null
            const isSensitive = item.sensitive
            const isVisible   = show[item.key]

            return (
              <div key={item.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {item.label}
                  {isSensitive && (
                    <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 pr-10"
                  />
                  {isSensitive && (
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, [item.key]: !s[item.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando…' : 'Guardar configuración'}
            </button>
            <p className="text-xs text-gray-400">
              Los campos sensibles vacíos no se sobreescriben
            </p>
          </div>
        </form>
      </section>

      {/* Lista de profesionales */}
      <ProfessionalsSection notify={notify} />

      {/* Lista de familias */}
      <ParentsSection />

      {/* Cambio de contraseña */}
      <ChangePasswordSection notify={notify} />

    </div>
  )
}

const ZONE_LABELS = { CABA:'CABA', GBA_Norte:'GBA Norte', GBA_Sur:'GBA Sur', GBA_Oeste:'GBA Oeste' }

// ── Sección lista de profesionales ────────────────────────────────────────
function ProfessionalsSection({ notify }) {
  const [pros, setPros]       = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ category:'', zone:'', verified:'' })
  const [verifying, setVerifying]       = useState({})
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
        method: 'POST', headers: headers(),
        body: JSON.stringify({ verified }),
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
        method: 'POST', headers: headers(),
        body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setPros(ps => ps.map(p => p.userId === pro.userId
        ? { ...p, user: { ...p.user, status: active ? 'subscribed' : 'active' } } : p))
      notify('ok', active ? `Suscripción activada para ${pro.name}` : `Suscripción desactivada para ${pro.name}`)
    } catch (err) { notify('err', err.message) }
    setTogglingSubscription(v => ({ ...v, [pro.userId]: false }))
  }

  const selectClass = 'pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white'

  return (
    <section>
      <h2 className="font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-teal-500" /> Profesionales
      </h2>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className={selectClass}>
              <option value="">Todas las especialidades</option>
              {Object.entries(CATEGORY_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
            <select value={filters.zone} onChange={e => setFilter('zone', e.target.value)} className={selectClass}>
              <option value="">Todas las zonas</option>
              {Object.entries(ZONE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="relative">
            <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
            <select value={filters.verified} onChange={e => setFilter('verified', e.target.value)} className={selectClass}>
              <option value="">Todos</option>
              <option value="true">Solo verificados</option>
              <option value="false">Solo pendientes</option>
            </select>
          </div>
          <button
            onClick={() => load(filters)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-colors"
          >
            <Filter className="w-3.5 h-3.5"/> Filtrar
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2"/> Cargando…
          </div>
        ) : pros.length === 0 ? (
          <p className="text-center py-10 text-sm text-gray-400">No hay profesionales con esos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
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
              <tbody className="divide-y divide-gray-50">
                {pros.map(pro => (
                  <tr key={pro.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-800">{pro.name}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{pro.user?.email}</td>
                    <td className="py-3 pr-4 text-gray-600 hidden sm:table-cell">{CATEGORY_LABELS[pro.category] ?? pro.category}</td>
                    <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{ZONE_LABELS[pro.zone] ?? pro.zone}</td>
                    <td className="py-3 pr-4 text-teal-600 font-semibold hidden md:table-cell">${Number(pro.hourlyRate).toLocaleString('es-AR')}</td>
                    <td className="py-3 pr-4">
                      {pro.verified
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full w-fit"><ShieldCheck className="w-3 h-3"/>Verificado</span>
                        : <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit"><ShieldX className="w-3 h-3"/>Pendiente</span>
                      }
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      {pro.user?.status === 'subscribed'
                        ? <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">Activa</span>
                        : <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Inactiva</span>
                      }
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          disabled={verifying[pro.userId]}
                          onClick={() => handleVerify(pro, !pro.verified)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                            pro.verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-teal-500 text-white hover:bg-teal-600'
                          }`}
                        >
                          {verifying[pro.userId] ? '…' : pro.verified ? 'Quitar verificación' : 'Verificar'}
                        </button>
                        <button
                          disabled={togglingSubscription[pro.userId]}
                          onClick={() => handleSubscription(pro, pro.user?.status !== 'subscribed')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                            pro.user?.status === 'subscribed' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-sky-500 text-white hover:bg-sky-600'
                          }`}
                        >
                          {togglingSubscription[pro.userId] ? '…' : pro.user?.status === 'subscribed' ? 'Desactivar suscripción' : 'Activar suscripción'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">{pros.length} profesional{pros.length !== 1 ? 'es' : ''}</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Sección lista de familias ─────────────────────────────────────────────
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
        method: 'POST', headers: headers(),
        body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setParents(ps => ps.map(x => x.userId === p.userId
        ? { ...x, user: { ...x.user, status: active ? 'subscribed' : 'active' } } : x))
    } catch { /* silent */ }
    setToggling(t => ({ ...t, [p.userId]: false }))
  }

  return (
    <section>
      <h2 className="font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-teal-500" /> Familias registradas
      </h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Cargando…
          </div>
        ) : parents.length === 0 ? (
          <p className="text-center py-10 text-sm text-gray-400">No hay familias registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-semibold">Nombre</th>
                  <th className="text-left py-2 pr-4 font-semibold">Email</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Teléfono</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden md:table-cell">Dirección</th>
                  <th className="text-left py-2 pr-4 font-semibold hidden sm:table-cell">Suscripción</th>
                  <th className="py-2"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {parents.map(p => (
                  <tr key={p.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{p.user?.email}</td>
                    <td className="py-3 pr-4 text-gray-600 hidden sm:table-cell">{p.phone}</td>
                    <td className="py-3 pr-4 text-gray-600 hidden md:table-cell">{p.address}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      {p.user?.status === 'subscribed'
                        ? <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">Activa</span>
                        : <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Inactiva</span>
                      }
                    </td>
                    <td className="py-3">
                      <button
                        disabled={toggling[p.userId]}
                        onClick={() => handleSubscription(p, p.user?.status !== 'subscribed')}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                          p.user?.status === 'subscribed'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-sky-500 text-white hover:bg-sky-600'
                        }`}
                      >
                        {toggling[p.userId] ? '…' : p.user?.status === 'subscribed' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">{parents.length} familia{parents.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Sección cambio de contraseña ───────────────────────────────────────────
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
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      notify('ok', 'Contraseña actualizada correctamente')
    } catch (err) {
      notify('err', err.message)
    }
    setSaving(false)
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

  return (
    <section>
      <h2 className="font-heading font-bold text-gray-700 mb-4 flex items-center gap-2">
        <Lock className="w-5 h-5 text-teal-500" /> Cambiar Contraseña
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña actual</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              placeholder="Tu contraseña actual"
              className={`${inputClass} pr-10`}
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
          <input type="password" required minLength={6} value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            placeholder="Mínimo 6 caracteres" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar nueva contraseña</label>
          <input type="password" required value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            placeholder="Repetí la nueva contraseña" className={inputClass} />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando…' : 'Actualizar contraseña'}
        </button>
      </form>
    </section>
  )
}
