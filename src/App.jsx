import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LegalPage from './pages/LegalPage'
import SearchPage from './pages/SearchPage'
import CargarAntecedentesPage from './pages/CargarAntecedentesPage'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--cuidar-nieve)' }}>
      <p className="text-6xl font-bold mb-4" style={{ color: 'var(--cuidar-verde-institucional)' }}>404</p>
      <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--cuidar-tinta)' }}>
        Página no encontrada
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--cuidar-gris-suave)' }}>
        El enlace que seguiste no existe o fue movido.
      </p>
      <Link to="/" className="px-6 py-3 text-white text-sm font-bold"
        style={{ background: 'var(--cuidar-verde-institucional)' }}>
        Volver al inicio
      </Link>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
          <Route path="/legal/:slug"     element={<LegalPage />} />
          <Route path="/buscar"          element={<SearchPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/cargar-antecedentes" element={
            <ProtectedRoute>
              <CargarAntecedentesPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
