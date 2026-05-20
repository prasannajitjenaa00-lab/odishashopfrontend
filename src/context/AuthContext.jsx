import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('odisha_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('odisha_user', JSON.stringify(user))
    else localStorage.removeItem('odisha_user')
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data.user)
      localStorage.setItem('odisha_token', data.token)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    } finally { setLoading(false) }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      setUser(data.user)
      localStorage.setItem('odisha_token', data.token)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    } finally { setLoading(false) }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('odisha_token')
    localStorage.removeItem('odisha_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
