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

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
]
const CATEGORIES_REQUIRING_CREDENTIAL = ['salud', 'terapeutico']

// Validación CUIL offline (dígito verificador)
function validateCuil(raw) {
  const clean = (raw ?? '').replace(/[-\s.]/g, '')
  if (!/^\d{11}$/.test(clean)) return false
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(clean[i]), 0)
  const rem = sum % 11
  const verifier = rem === 0 ? 0 : rem === 1 ? 9 : 11 - rem
  return parseInt(clean[10]) === verifier
}

const DEFAULTS = {
  email: '', password: '', confirmPassword: '',
  role: '', name: '', phone: '',
  zone: '', categories: [], hourlyRate: '', travelRadiusKm: '15',
  address: '', maxDistanceKm: '15',
  dni: '', cuil: '',
  credentials: [], // [{ type: 'matricula_nacional'|'matricula_provincial', number: '', province: '' }]
  consentimiento: false,
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function RegisterPage() {
  const { register }  = useAuth()
  const navigate      = useNavigate()
  const [searchParams] = useSearchParams()
  const preRole       = VALID_ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : ''
  const [form, setForm]   = useState({ ...DEFAULTS, role: preRole })
  const [certificadoPdf, setCertificadoPdf] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleCat = (val) => setForm((f) => ({
    ...f,
    categories: f.categories.includes(val)
      ? f.categories.filter((c) => c !== val)
      : [...f.categories, val],
  }))

  const needsCredential = form.role === 'profesional' &&
    form.categories.some((c) => CATEGORIES_REQUIRING_CREDENTIAL.includes(c))

  const toggleCredType = (type) => setForm((f) => {
    const has = f.credentials.some((c) => c.type === type)
    return {
      ...f,
      credentials: has
        ? f.credentials.filter((c) => c.type !== type)
        : [...f.credentials, { type, number: '', province: '' }],
    }
  })
  const setCredField = (type, field, val) => setForm((f) => ({
    ...f,
    credentials: f.credentials.map((c) => c.type === type ? { ...c, [field]: val } : c),
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden')
    if (!form.role) return setError('Elegí un tipo de cuenta')
    if (!form.consentimiento) return setError('Debés aceptar el tratamiento de datos personales (Ley 25.326) para continuar.')
    if (form.role === 'profesional' && form.categories.length === 0) return setError('Elegí al menos una especialidad')
    if (form.role === 'profesional' && !certificadoPdf) return setError('Debés adjuntar tu Certificado de Antecedentes Penales en PDF.')
    // Validaciones de identidad
    const dniClean = form.dni.replace(/\./g, '').trim()
    if (!/^\d{7,8}$/.test(dniClean)) return setError('DNI inválido — ingresá 7 u 8 dígitos sin puntos.')
    if (!validateCuil(form.cuil)) return setError('CUIL inválido — verificá el formato (XX-XXXXXXXX-X).')
    if (needsCredential && form.credentials.length === 0)
      return setError('Enfermería y Acompañante Terapéutico requieren al menos una matrícula.')
    if (needsCredential && form.credentials.some((c) => !c.number.trim()))
      return setError('Completá el número de todas las matrículas ingresadas.')
    setLoading(true)
    try {
      await register({ ...form, consentimientoAntecedentes: form.consentimiento })
      // Paso 2: subir PDF del certificado (solo profesionales)
      if (form.role === 'profesional' && certificadoPdf) {
        const token = localStorage.getItem('token')
        const fd = new FormData()
        fd.append('certificate', certificadoPdf)
        await fetch(`${API_BASE}/api/professional/certificate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
      }
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

            {/* Identificación — obligatoria para todos los roles */}
            <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cuidar-verde-institucional)', letterSpacing: '0.18em' }}>
                Verificación de identidad
              </p>
              <p className="text-xs" style={{ color: 'var(--cuidar-gris-suave)' }}>
                Requerido para todos los usuarios. Tus datos son privados y solo los ve el equipo de CuidAR 360 para garantizar la seguridad de la plataforma.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>DNI <span style={{ color: '#D9544D' }}>*</span></label>
                  <input type="text" required value={form.dni} onChange={e => set('dni', e.target.value)}
                    placeholder="Ej: 38123456" maxLength={9}
                    className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>CUIL <span style={{ color: '#D9544D' }}>*</span></label>
                  <input type="text" required value={form.cuil} onChange={e => set('cuil', e.target.value)}
                    placeholder="Ej: 20-38123456-9" maxLength={13}
                    className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
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

                {/* Matrícula — solo si seleccionó salud o terapéutico */}
                {needsCredential && (
                  <div className="p-4" style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>
                      Matrícula profesional <span style={{ color: '#D9544D' }}>*</span>
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--cuidar-gris-suave)' }}>
                      Enfermería y Acompañante Terapéutico requieren al menos una matrícula habilitante. El equipo de CuidAR 360 la verificará antes de activar tu perfil verificado.
                    </p>
                    <div className="space-y-3">
                      {[
                        { type: 'matricula_nacional', label: 'Matrícula Nacional' },
                        { type: 'matricula_provincial', label: 'Matrícula Provincial' },
                      ].map(({ type, label }) => {
                        const cred = form.credentials.find((c) => c.type === type)
                        return (
                          <div key={type}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input type="checkbox" checked={!!cred} onChange={() => toggleCredType(type)}
                                className="w-4 h-4 accent-[#1F4D3A]" />
                              <span className="text-sm font-semibold" style={{ color: 'var(--cuidar-tinta)' }}>{label}</span>
                            </label>
                            {cred && (
                              <div className={`grid gap-3 ml-6 ${type === 'matricula_provincial' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <input type="text" value={cred.number}
                                  onChange={e => setCredField(type, 'number', e.target.value)}
                                  placeholder="Número de matrícula"
                                  className={inputCls} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                                {type === 'matricula_provincial' && (
                                  <select value={cred.province}
                                    onChange={e => setCredField(type, 'province', e.target.value)}
                                    className="w-full px-4 py-3 border text-sm outline-none appearance-none"
                                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                                    <option value="">Provincia</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

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

                {/* Certificado de Antecedentes Penales — obligatorio para profesionales */}
                <div className="p-4" style={{ background: 'var(--cuidar-nieve)', border: '1px solid var(--cuidar-borde)' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>
                    Certificado de Antecedentes Penales <span style={{ color: '#D9544D' }}>*</span>
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'var(--cuidar-gris-suave)' }}>
                    Adjuntá el PDF emitido por el{' '}
                    <a href="https://www.argentina.gob.ar/justicia/reincidencia/antecedentespenales"
                      target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--cuidar-verde-institucional)', textDecoration: 'underline' }}>
                      Registro Nacional de Reincidencia
                    </a>
                    . El equipo de CuidAR 360 lo revisará antes de habilitar tu cuenta. Solo PDF, máx 5 MB.
                  </p>
                  <input type="file" accept="application/pdf"
                    onChange={e => setCertificadoPdf(e.target.files?.[0] ?? null)}
                    className="w-full text-sm" style={{ color: 'var(--cuidar-texto)' }} />
                  {certificadoPdf && (
                    <p className="text-xs mt-1" style={{ color: 'var(--cuidar-verde-institucional)' }}>
                      ✓ {certificadoPdf.name}
                    </p>
                  )}
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

            {/* Consentimiento Ley 25.326 — obligatorio para todos los roles */}
            <div className="flex items-start gap-3 pt-4" style={{ borderTop: '1px solid var(--cuidar-borde)' }}>
              <input type="checkbox" id="consentimiento" checked={form.consentimiento}
                onChange={e => set('consentimiento', e.target.checked)}
                className="w-4 h-4 mt-0.5 flex-shrink-0 accent-[#1F4D3A]" required />
              <label htmlFor="consentimiento" className="text-xs leading-relaxed cursor-pointer" style={{ color: 'var(--cuidar-gris-suave)' }}>
                Acepto que CuidAR 360 trate mis datos personales, incluyendo DNI, CUIL
                {form.role === 'profesional' ? ' y Certificado de Antecedentes Penales' : ''}, con fines de
                verificación de identidad, conforme a la{' '}
                <strong style={{ color: 'var(--cuidar-tinta)' }}>Ley 25.326 de Protección de Datos Personales</strong>.
                Los datos son confidenciales y no se compartirán con terceros sin tu consentimiento.
              </label>
            </div>

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
