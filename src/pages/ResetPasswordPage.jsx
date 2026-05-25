import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Heart, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function ResetPasswordPage() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const token           = searchParams.get('token') || ''

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

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-heading font-bold text-2xl">
              <span className="text-teal-500">CUID</span><span className="text-gray-700">_AR</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {!token ? (
            <div className="text-center space-y-3">
              <p className="text-red-500 font-medium">Enlace inválido o faltante.</p>
              <Link to="/forgot-password" className="text-teal-600 text-sm font-semibold hover:underline">
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-teal-500 mx-auto" />
              <h2 className="font-heading text-xl font-bold text-gray-800">Contraseña actualizada</h2>
              <p className="text-sm text-gray-500">Te redirigimos al inicio de sesión…</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-xl font-bold text-gray-800 mb-1">Nueva contraseña</h2>
              <p className="text-sm text-gray-500 mb-6">Elegí una contraseña nueva para tu cuenta.</p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={show ? 'text' : 'password'} required minLength={6}
                      value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
                  <input type="password" required value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repetí la nueva contraseña" className={inputClass} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-60">
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
