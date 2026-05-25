import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [profile, setProfile] = useState(null) // professional | parent data
  const [loading, setLoading] = useState(true)

  // Rehidrata sesión al recargar
  useEffect(() => {
    const saved = localStorage.getItem('user')
    const savedProfile = localStorage.getItem('profile')
    if (saved && token) {
      setUser(JSON.parse(saved))
      if (savedProfile) setProfile(JSON.parse(savedProfile))
    }
    setLoading(false)
  }, [])

  const persist = (tok, usr, prof) => {
    localStorage.setItem('token', tok)
    localStorage.setItem('user', JSON.stringify(usr))
    if (prof) localStorage.setItem('profile', JSON.stringify(prof))
    setToken(tok)
    setUser(usr)
    setProfile(prof ?? null)
  }

  const login = async (email, password) => {
    let res
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    } catch (netErr) {
      console.error('[login] network error:', netErr)
      throw new Error('Sin conexión con el servidor')
    }

    const text = await res.text()
    console.log('[login] status:', res.status, '| body:', text.substring(0, 300))

    let data
    try {
      data = JSON.parse(text)
    } catch (parseErr) {
      console.error('[login] JSON parse failed. Raw response:', text)
      throw new Error(`Error del servidor (${res.status}). Intentá de nuevo.`)
    }

    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
    persist(data.token, data.user, data.profile ?? null)
    return data.user
  }

  const register = async (payload) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al registrarse')
    persist(data.token, data.user, data.profile ?? null)
    return data.user
  }

  const refreshUser = async () => {
    const tok = localStorage.getItem('token')
    if (!tok) return
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      })
      if (!res.ok) return
      const data = await res.json()
      persist(tok, data.user, data.profile ?? null)
    } catch { /* silent */ }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, profile, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
