import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DashboardProfessional from '../components/DashboardProfessional'
import DashboardParent from '../components/DashboardParent'
import AdminDashboard from '../components/AdminDashboard'

const ROLE_LABELS = { padre: 'Familia', profesional: 'Profesional', admin: 'Administrador' }
const ROLE_BADGE  = {
  padre:        'bg-amber-100 text-amber-700',
  profesional:  'bg-teal-100 text-teal-700',
  admin:        'bg-purple-100 text-purple-700',
}

export default function DashboardPage() {
  const { user, profile, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    // Siempre refresca el estado del usuario al entrar al dashboard.
    // Si viene de MP (?payment=1), limpia el param después de refrescar.
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
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-heading font-bold text-lg">
              <span className="text-teal-500">CUID</span>
              <span className="text-gray-700">_AR</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {profile?.name ?? user?.email}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[user?.role]}`}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
            >
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
