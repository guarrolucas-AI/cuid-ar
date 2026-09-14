import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Isotipo } from '../lib/Isotipo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {
      setError('Error al enviar el email. Intentá de nuevo.')
    }
    setLoading(false)
  }

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
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-10 h-10 mx-auto" style={{ color: 'var(--cuidar-verde-institucional)' }} />
              <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--cuidar-tinta)' }}>Revisá tu email</h2>
              <p className="text-sm" style={{ color: 'var(--cuidar-gris-medio)' }}>
                Si ese email está registrado, vas a recibir un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold mt-4"
                style={{ color: 'var(--cuidar-verde-institucional)' }}>
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold mb-1" style={{ color: 'var(--cuidar-tinta)' }}>
                Olvidé mi contraseña
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--cuidar-gris-suave)' }}>
                Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 border text-sm"
                  style={{ background: 'var(--cuidar-coral-soft)', borderColor: '#D9544D', color: '#B8433D' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--cuidar-tinta)' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--cuidar-gris-suave)' }} />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 border text-sm outline-none"
                      style={{ borderColor: 'var(--cuidar-borde)', color: 'var(--cuidar-texto)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--cuidar-verde-institucional)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--cuidar-borde)'}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                  style={{ background: 'var(--cuidar-verde-institucional)' }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-700)')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--cuidar-verde-institucional)')}>
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm transition-colors"
                  style={{ color: 'var(--cuidar-gris-suave)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cuidar-verde-institucional)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--cuidar-gris-suave)'}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
