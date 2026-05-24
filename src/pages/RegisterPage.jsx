import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, AlertCircle, Baby, Home, Users, GraduationCap, Stethoscope, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ZONES = ['CABA', 'GBA_Norte', 'GBA_Sur', 'GBA_Oeste']
const ZONE_LABELS = { CABA: 'CABA', GBA_Norte: 'GBA Norte', GBA_Sur: 'GBA Sur', GBA_Oeste: 'GBA Oeste' }

const CATEGORIES = [
  { value: 'infantil',    label: 'Cuidado Infantil',   icon: Baby },
  { value: 'pedagogico',  label: 'Apoyo Pedagógico',   icon: GraduationCap },
  { value: 'salud',       label: 'Salud Pediátrica',   icon: Stethoscope },
  { value: 'terapeutico', label: 'Cuidado Terapéutico',icon: Users },
  { value: 'limpieza',    label: 'Limpieza del Hogar', icon: Sparkles },
]

const DEFAULTS = {
  email: '', password: '', confirmPassword: '',
  role: '', name: '', phone: '',
  // profesional
  zone: '', category: '', hourlyRate: '',
  // padre
  address: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState(DEFAULTS)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden')
    if (!form.role) return setError('Elegí un tipo de cuenta')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-heading font-bold text-2xl">
            <span className="text-teal-500">CUID</span>
            <span className="text-gray-700">_AR</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h1 className="font-heading text-2xl font-bold text-gray-800 mb-1">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mb-7">Unite a la red de cuidado profesional</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Tipo de cuenta */}
            <div>
              <p className={labelClass}>Soy…</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'padre',       label: 'Familia',      sub: 'Busco profesionales', icon: Home },
                  { value: 'profesional', label: 'Profesional',  sub: 'Ofrezco mis servicios', icon: Baby },
                ].map(({ value, label, sub, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('role', value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                      form.role === value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-600 hover:border-teal-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-xs opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos comunes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo</label>
                <input type="text" required value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nombre Apellido" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono / WhatsApp</label>
                <input type="tel" required value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="11 1234-5678" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="tu@email.com" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contraseña</label>
                <input type="password" required minLength={6} value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Mín. 6 caracteres" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirmar contraseña</label>
                <input type="password" required value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Repetí la contraseña" className={inputClass} />
              </div>
            </div>

            {/* Campos Profesional */}
            {form.role === 'profesional' && (
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Datos profesionales</p>

                <div>
                  <label className={labelClass}>Especialidad</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map(({ value, label, icon: Icon }) => (
                      <button key={value} type="button"
                        onClick={() => set('category', value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                          form.category === value
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 text-gray-600 hover:border-teal-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Zona donde trabajás</label>
                    <select value={form.zone} onChange={(e) => set('zone', e.target.value)} required
                      className={inputClass}>
                      <option value="">Seleccioná zona</option>
                      {ZONES.map((z) => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tarifa por hora ($)</label>
                    <input type="number" required min="0" step="100" value={form.hourlyRate}
                      onChange={(e) => set('hourlyRate', e.target.value)}
                      placeholder="Ej: 5900" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Campos Padre */}
            {form.role === 'padre' && (
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Datos de tu hogar</p>
                <div>
                  <label className={labelClass}>Dirección o barrio</label>
                  <input type="text" required value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Ej: Palermo, CABA" className={inputClass} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !form.role}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-2">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Ingresá acá</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
