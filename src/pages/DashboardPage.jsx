import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Isotipo } from '../lib/Isotipo'
import DashboardProfessional from '../components/DashboardProfessional'
import DashboardParent from '../components/DashboardParent'
import AdminDashboard from '../components/AdminDashboard'

const ROLE_LABELS = { padre: 'Familia', profesional: 'Profesional', admin: 'Administrador' }

export default function DashboardPage() {
  const { user, profile, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const fromPayment = searchParams.get('payment') === '1'
    refreshUser().then(() => {
      if (fromPayment) setSearchParams({}, { replace: true })
    })
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cuidar-nieve)' }}>

      {/* Top bar */}
      <header className="sticky top-0 z-40" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--cuidar-borde)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Isotipo className="w-8 h-8" />
            <span className="font-heading font-bold text-lg" style={{ color: 'var(--cuidar-tinta)' }}>
              CuidAR <span style={{ color: 'var(--cuidar-verde-institucional)' }}>360</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--cuidar-tinta)' }}>
                {profile?.name ?? user?.email}
              </p>
              <span className="text-xs font-semibold px-2 py-0.5" style={{ background: 'var(--cuidar-nieve)', color: 'var(--cuidar-gris-medio)', border: '1px solid var(--cuidar-borde)' }}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm px-3 py-2 transition-colors"
              style={{ color: 'var(--cuidar-gris-suave)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--cuidar-coral-humano)'; e.currentTarget.style.background = 'var(--cuidar-coral-soft)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--cuidar-gris-suave)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido según rol */}
      <main className="py-8">
        {user?.role === 'profesional' && (
          <DashboardProfessional user={user} professional={profile ?? {
            name: user.email, verified: false, available: true, hourlyRate: 0, category: ''
          }} />
        )}
        {user?.role === 'padre' && <DashboardParent user={user} profile={profile} />}
        {user?.role === 'admin'  && <AdminDashboard />}
      </main>
    </div>
  )
}
