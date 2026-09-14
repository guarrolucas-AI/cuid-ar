import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Isotipo } from '../lib/Isotipo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const token          = searchParams.get('token') || ''

  const [form, setForm]     = useState({ newPassword: '', confirm: '' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return setError('Las contraseñas no coinciden')
    if (form.newPassword.length < 6) return setError('Mínimo 6 caracteres')
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle = { borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }
  const inputFocus = e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'
  const inputBlur  = e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Isotipo size={36} variant="color" />
          <span className="font-heading font-bold text-xl tracking-tight">
            <span style={{ color: 'var(--cuidar-verde-institucional)' }}>CuidAR</span>
            <span style={{ color: 'var(--cuidar-gris-medio)' }}> 360</span>
          </span>
        </Link>

        <div className="border p-8" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
          {!token ? (
            <div className="text-center space-y-3">
              <p className="font-medium" style={{ color: '#D9544D' }}>Enlace inválido o faltante.</p>
              <Link to="/forgot-password" className="text-sm font-semibold"
                style={{ color: 'var(--cuidar-verde-institucional)' }}>
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-10 h-10 mx-auto" style={{ color: 'var(--cuidar-verde-institucional)' }} />
              <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>
                Contraseña actualizada
              </h2>
              <p className="text-sm" style={{ color: 'var(--cuidar-gris-medio)' }}>Te redirigimos al inicio de sesión…</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>
                Nueva contraseña
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--cuidar-gris-suave)' }}>
                Elegí una contraseña nueva para tu cuenta.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 border text-sm"
                  style={{ background: 'var(--cuidar-coral-soft)', borderColor: '#D9544D', color: '#B8433D' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                    <input
                      type={show ? 'text' : 'password'} required minLength={6}
                      value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-3 border text-sm outline-none"
                      style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--cuidar-gris-suave)' }}>
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>
                    Confirmar contraseña
                  </label>
                  <input type="password" required value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repetí la nueva contraseña"
                    className="w-full px-4 py-3 border text-sm outline-none"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  style={{ background: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-institucional)')}>
                  {loading ? 'Guardando…' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
