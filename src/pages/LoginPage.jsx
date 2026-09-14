import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Isotipo } from '../lib/Isotipo'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--cuidar-nieve)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Isotipo size={36} variant="color" />
          <span className="font-heading font-bold text-xl tracking-tight">
            <span style={{ color: 'var(--cuidar-verde-institucional)' }}>CuidAR</span>
            <span style={{ color: 'var(--cuidar-gris-medio)' }}> 360</span>
          </span>
        </Link>

        <div className="border p-8" style={{ background: '#FFFFFF', borderColor: 'var(--cuidar-borde)' }}>
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--cuidar-gris-suave)' }}>
            Ingresá con tu cuenta para continuar
          </p>

          {error && (
            <div className="flex items-center gap-2 border text-sm px-4 py-3 mb-5"
              style={{ background: 'var(--cuidar-coral-soft)', borderColor: '#D9544D', color: '#B8433D' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border text-sm outline-none"
                  style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border text-sm outline-none"
                  style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)', background: '#FFFFFF' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white font-bold text-sm mt-2 transition-colors disabled:opacity-60"
              style={{ background: 'var(--cuidar-verde-institucional)' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-institucional)')}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm transition-colors"
              style={{ color: 'var(--cuidar-gris-suave)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--cuidar-gris-medio)' }}>
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-semibold"
              style={{ color: 'var(--cuidar-verde-institucional)' }}>
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
