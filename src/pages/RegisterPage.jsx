import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Isotipo } from '../lib/Isotipo'
import { IconInfantil, IconPedagogico, IconSalud, IconTerapeutico, IconLimpieza } from '../lib/serviceIcons'

const ZONES        = ['CABA', 'GBA_Norte', 'GBA_Sur', 'GBA_Oeste']
const ZONE_LABELS  = { CABA: 'CABA', GBA_Norte: 'GBA Norte', GBA_Sur: 'GBA Sur', GBA_Oeste: 'GBA Oeste' }
const RADIUS_OPTIONS = ['5', '10', '15', '20', '30', '50']
const VALID_ROLES  = ['padre', 'profesional']

const CATEGORIES = [
  { value: 'infantil',    label: 'Cuidado Infantil',    Icon: IconInfantil },
  { value: 'pedagogico',  label: 'Apoyo Pedagógico',    Icon: IconPedagogico },
  { value: 'salud',       label: 'Salud Pediátrica',    Icon: IconSalud },
  { value: 'terapeutico', label: 'Cuidado Terapéutico', Icon: IconTerapeutico },
  { value: 'limpieza',    label: 'Limpieza del Hogar',  Icon: IconLimpieza },
]

const DEFAULTS = {
  email: '', password: '', confirmPassword: '',
  role: '', name: '', phone: '',
  zone: '', categories: [], hourlyRate: '', travelRadiusKm: '15',
  address: '', maxDistanceKm: '15',
}

export default function RegisterPage() {
  const { register }  = useAuth()
  const navigate      = useNavigate()
  const [searchParams] = useSearchParams()
  const preRole       = VALID_ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : ''
  const [form, setForm]   = useState({ ...DEFAULTS, role: preRole })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleCat = (val) => setForm((f) => ({
    ...f,
    categories: f.categories.includes(val)
      ? f.categories.filter((c) => c !== val)
      : [...f.categories, val],
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden')
    if (!form.role) return setError('Elegí un tipo de cuenta')
    if (form.role === 'profesional' && form.categories.length === 0) return setError('Elegí al menos una especialidad')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }
  const inputFocus = e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'
  const inputBlur  = e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'
  const inputCls   = 'w-full px-4 py-3 border text-sm outline-none'

  const selectedBtnStyle = { borderColor: 'var(--cuidar-verde-institucional)', background: 'var(--cuidar-nieve)', color: 'var(--cuidar-verde-institucional)' }
  const unselBtnStyle    = { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="w-full max-w-lg">

        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Isotipo size={36} variant="color" />
          <span className="font-heading font-bold text-xl tracking-tight">
            <span style={{ color: 'var(--cuidar-verde-institucional)' }}>CuidAR</span>
            <span style={{ color: 'var(--cuidar-gris-medio)' }}> 360</span>
          </span>
        </Link>

        <div className="border p-8" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>Crear cuenta</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--cuidar-gris-suave)' }}>Unite a la red de cuidado profesional</p>

          {error && (
            <div className="flex items-center gap-2 border text-sm px-4 py-3 mb-5"
              style={{ background: 'var(--cuidar-coral-soft)', borderColor: '#D9544D', color: '#B8433D' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Tipo de cuenta */}
            <div>
              <p className="block text-sm font-semibold mb-2" style={{ color: 'var(--cuidar-tinta)' }}>Soy…</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'padre',       label: 'Familia',     sub: 'Busco profesionales', Icon: Home },
                  { value: 'profesional', label: 'Profesional', sub: 'Ofrezco mis servicios', Icon: IconInfantil },
                ].map(({ value, label, sub, Icon }) => (
                  <button key={value} type="button" onClick={() => set('role', value)}
                    className="flex flex-col items-center gap-2 p-4 border-2 transition-all text-center text-sm"
                    style={form.role === value ? selectedBtnStyle : unselBtnStyle}>
                    <Icon size={24} style={{ color: form.role === value ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-gris-suave)' }} />
                    <span className="font-semibold">{label}</span>
                    <span className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos comunes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Nombre completo</label>
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Nombre Apellido" className={inputCls} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Teléfono / WhatsApp</label>
                <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="11 1234-5678" className={inputCls} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Email</label>
              <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="tu@email.com" className={inputCls} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Contraseña</label>
                <input type="password" required minLength={6} value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="Mín. 6 caracteres"
                  className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Confirmar contraseña</label>
                <input type="password" required value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)} placeholder="Repetí la contraseña"
                  className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>

            {/* Campos Profesional */}
            {form.role === 'profesional' && (
              <div className="space-y-4 pt-5" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
                  Datos profesionales
                </p>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Especialidad(es)</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--cuidar-gris-suave)' }}>Podés elegir más de una si ofrecés varios servicios.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map(({ value, label, Icon }) => {
                      const sel = form.categories.includes(value)
                      return (
                        <button key={value} type="button" onClick={() => toggleCat(value)} aria-pressed={sel}
                          className="flex items-center gap-2 px-3 py-2.5 border-2 text-xs font-semibold transition-all"
                          style={sel ? selectedBtnStyle : unselBtnStyle}>
                          <Icon size={16} style={{ color: sel ? 'var(--cuidar-verde-institucional)' : 'var(--cuidar-gris-suave)', flexShrink: 0 }} />
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Zona donde trabajás</label>
                    <select value={form.zone} onChange={e => set('zone', e.target.value)} required
                      className="w-full px-4 py-3 border text-sm outline-none appearance-none"
                      style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                      <option value="">Seleccioná zona</option>
                      {ZONES.map(z => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Tarifa por hora ($)</label>
                    <input type="number" required min="0" step="100" value={form.hourlyRate}
                      onChange={e => set('hourlyRate', e.target.value)} placeholder="Ej: 5900"
                      className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Tu dirección exacta</label>
                  <input type="text" required value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Ej: Av. Corrientes 1234, CABA"
                    className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                  <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                    Nunca se muestra a otros usuarios — solo la usamos para calcular la distancia.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>¿Hasta cuántos km te trasladás?</label>
                  <select value={form.travelRadiusKm} onChange={e => set('travelRadiusKm', e.target.value)}
                    className="w-full px-4 py-3 border text-sm outline-none appearance-none"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r}>Hasta {r} km</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Campos Padre */}
            {form.role === 'padre' && (
              <div className="space-y-4 pt-5" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
                  Datos de tu hogar
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Dirección o barrio</label>
                  <input type="text" required value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Ej: Palermo, CABA"
                    className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                  <p className="text-xs mt-1" style={{ color: 'var(--cuidar-gris-suave)' }}>
                    Nunca se muestra a otros usuarios — solo la usamos para calcular la distancia.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>¿Hasta cuántos km aceptás que se traslade el profesional?</label>
                  <select value={form.maxDistanceKm} onChange={e => set('maxDistanceKm', e.target.value)}
                    className="w-full px-4 py-3 border text-sm outline-none appearance-none"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r}>Hasta {r} km</option>)}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !form.role}
              className="w-full py-3.5 text-white font-bold text-sm mt-2 transition-colors disabled:opacity-50"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => (!loading && form.role) && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--cuidar-verde-institucional)')}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--cuidar-gris-medio)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--cuidar-verde-institucional)' }}>
              Ingresá acá
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
