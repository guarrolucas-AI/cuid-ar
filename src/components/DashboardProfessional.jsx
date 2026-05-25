import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldX, ToggleLeft, ToggleRight, Save, User, Phone, MapPin, Tag, Bell, RefreshCw, Lock, CreditCard } from 'lucide-react'

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

  const patch = async (body) => {
    const res = await fetch(`${API_BASE}/api/professional/me`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  }

  const subscribed = user.status === 'subscribed'

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-teal-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-800">{pro.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs font-semibold bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
              {CATEGORIES.find(c => c.value === pro.category)?.label ?? pro.category}
            </span>
            {subscribed
              ? <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <CreditCard className="w-3 h-3"/>Suscripción activa
                </span>
              : <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3"/>Sin suscripción
                </span>
            }
          </div>
        </div>
        {pro.verified
          ? <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full border border-teal-200 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" /><span className="text-sm font-semibold">Verificado</span>
            </div>
          : <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-200 flex-shrink-0">
              <ShieldX className="w-5 h-5" /><span className="text-sm font-semibold">Pendiente de verificación</span>
            </div>
        }
      </div>

      {/* Pantalla de pago si no tiene suscripción */}
      {!subscribed && <PaymentWall />}

      {/* Contenido solo para suscriptos */}
      {subscribed && (
        <>
          {/* Disponibilidad */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-heading font-bold text-gray-800 mb-4">Disponibilidad</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {pro.available ? 'Disponible para nuevas consultas' : 'No disponible en este momento'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all flex-shrink-0 ${
                  pro.available ? 'bg-teal-500 text-white hover:bg-teal-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {pro.available ? <><ToggleRight className="w-5 h-5"/>Activo</> : <><ToggleLeft className="w-5 h-5"/>Inactivo</>}
              </button>
            </div>
          </div>

          {/* Consultas recibidas */}
          <ContactRequests />

          {/* Mi perfil */}
          <ProfileForm pro={pro} setPro={setPro} patch={patch} notify={notify} />

          {/* Tarifa */}
          <RateForm pro={pro} setPro={setPro} patch={patch} notify={notify} />
        </>
      )}
    </div>
  )
}

function PaymentWall() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-gray-800">Activá tu suscripción</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Para recibir consultas de familias, aparecer en los resultados de búsqueda y acceder a todas las funciones, necesitás tener una suscripción activa.
      </p>
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1 text-left max-w-xs mx-auto">
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Aparecés en búsquedas</p>
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Recibís consultas de familias</p>
        <p className="flex items-center gap-2"><span className="text-red-400">✗</span> Editás tu perfil y tarifa</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 text-sm"
      >
        <CreditCard className="w-4 h-4"/>
        {loading ? 'Redirigiendo…' : 'Suscribirme ahora'}
      </button>
    </div>
  )
}

const CAT_LABELS = { infantil:'Cuidado Infantil', pedagogico:'Apoyo Pedagógico', salud:'Salud Pediátrica', terapeutico:'Cuidado Terapéutico', limpieza:'Limpieza del Hogar' }

function ContactRequests() {
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-teal-500" />
        Consultas recibidas
        {requests.length > 0 && (
          <span className="ml-1 bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
        )}
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <RefreshCw className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">Todavía no recibiste consultas de familias.</p>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 text-sm">{req.parent.name}</span>
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    {CAT_LABELS[req.category] ?? req.category}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{req.parent.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{req.parent.address}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(req.createdAt).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileForm({ pro, setPro, patch, notify }) {
  const [form, setForm] = useState({ name: pro.name, phone: pro.phone, zone: pro.zone, category: pro.category })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const u = await patch(form)
      setPro(p => ({ ...p, ...u }))
      notify('Perfil actualizado')
    } catch (err) { notify(err.message, false) }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-heading font-bold text-gray-800 mb-5">Mi Perfil</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5"/>Nombre</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputClass}/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/>Teléfono</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} required className={inputClass}/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>Zona</label>
            <select value={form.zone} onChange={e => set('zone', e.target.value)} required className={inputClass}>
              {ZONES.map(z => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5"/>Especialidad</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} required className={inputClass}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60 text-sm">
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}

function RateForm({ pro, setPro, patch, notify }) {
  const [rate, setRate]   = useState(String(pro.hourlyRate))
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-heading font-bold text-gray-800 mb-1">Tarifa por hora</h3>
      <p className="text-xs text-gray-400 mb-4">Actual: <span className="font-semibold text-teal-600">${Number(pro.hourlyRate).toLocaleString('es-AR')}/hr</span></p>
      <form onSubmit={handleSave} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} min="0" step="100" required
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"/>
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 disabled:opacity-60 text-sm flex-shrink-0">
          <Save className="w-4 h-4"/>{saving ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
