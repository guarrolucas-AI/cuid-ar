import { useState } from 'react'
import { Search, MapPin, Tag, DollarSign, Bell, CheckCircle, ShieldCheck, Save, User, Phone, Lock, CreditCard, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
    try {
      await fetch(`${API_BASE}/api/match/notify`, {
        method:'POST', headers: authHeaders(),
        body: JSON.stringify({ professionalId: pro.userId, category: pro.category }),
      })
      setNotified(p => ({ ...p, [pro.userId]: true }))
      notify('Notificación enviada al profesional')
    } catch { notify('Error al enviar la notificación', false) }
  }

  const selectClass = 'w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white'

  const subscribed = user.status === 'subscribed'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-teal-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header con badge suscripción */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-800">{init?.name ?? user.email}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
        {subscribed
          ? <span className="flex items-center gap-1.5 text-xs font-semibold bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full">
              <CreditCard className="w-3.5 h-3.5"/>Suscripción activa
            </span>
          : <span className="flex items-center gap-1.5 text-xs font-semibold bg-red-100 text-red-600 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5"/>Sin suscripción
            </span>
        }
      </div>

      {/* Pantalla de pago si no tiene suscripción */}
      {!subscribed && <ParentPaymentWall />}

      {subscribed && (
        <>
      {/* Perfil */}
      <ProfileForm user={user} init={init} notify={notify} />

      {/* Buscador */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-heading text-xl font-bold text-gray-800 mb-5">Buscar profesional</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className={selectClass}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            <select value={filters.zone} onChange={e => setFilter('zone', e.target.value)} className={selectClass}>
              {ZONES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            <select value={filters.maxRate} onChange={e => setFilter('maxRate', e.target.value)} className={selectClass}>
              {MAX_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSearch} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 w-full sm:w-auto justify-center">
          <Search className="w-4 h-4"/>{loading ? 'Buscando…' : 'Buscar profesionales'}
        </button>
      </div>

      {/* Resultados vacíos */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-14 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30"/>
          <p className="text-sm font-medium">No encontramos profesionales con esos filtros.</p>
          <p className="text-xs mt-1">Probá ampliando la zona o el presupuesto.</p>
        </div>
      )}

      {/* Cards */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium px-1">
            {results.length} profesional{results.length !== 1 ? 'es' : ''} disponible{results.length !== 1 ? 's' : ''}
          </p>
          {results.map(pro => (
            <div key={pro.userId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-bold text-gray-800">{pro.name}</h3>
                  {pro.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3"/>Verificado
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/>{CAT_LABELS[pro.category] ?? pro.category}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{ZONE_LABELS[pro.zone] ?? pro.zone}</span>
                  <span className="flex items-center gap-1 font-semibold text-teal-600">
                    <DollarSign className="w-3.5 h-3.5"/>${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr
                  </span>
                </div>
              </div>
              <button onClick={() => handleNotify(pro)} disabled={notified[pro.userId]}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0 ${
                  notified[pro.userId] ? 'bg-green-100 text-green-700 cursor-default' : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}>
                {notified[pro.userId]
                  ? <><CheckCircle className="w-4 h-4"/>Notificado</>
                  : <><Bell className="w-4 h-4"/>Contactar y Notificar</>}
              </button>
            </div>
          ))}
        </div>
      )}
        </>
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
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-gray-800">Activá tu suscripción</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Para buscar profesionales y contactarlos necesitás tener una suscripción activa.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1 text-left max-w-xs mx-auto">
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Buscar profesionales</p>
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Contactar y notificar</p>
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Ver perfiles verificados</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={handleSubscribe} disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 text-sm">
          <CreditCard className="w-4 h-4"/>
          {loading ? 'Redirigiendo…' : 'Suscribirme ahora'}
        </button>
        <button onClick={handleCheck} disabled={checking}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60 text-sm">
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
  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-heading font-bold text-gray-800 mb-5">Mi Perfil</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5"/>Nombre</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputClass}/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/>Teléfono</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputClass}/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>Dirección o barrio</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} required className={inputClass} placeholder="Ej: Palermo, CABA"/>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 text-sm">
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
