import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  if (user.status === 'suspended_docs' && location.pathname !== '/cargar-antecedentes')
    return <Navigate to="/cargar-antecedentes" replace />

  return children
}
