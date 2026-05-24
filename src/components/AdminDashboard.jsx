import { useState, useEffect } from 'react'
import {
  Settings, Users, ShieldCheck, ToggleLeft, ToggleRight,
  Save, Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Lock,
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

      {/* Cambio de contraseña */}
      <ChangePasswordSection notify={notify} />

    </div>
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
