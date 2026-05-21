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
      return { success: true, message: data.message, email: data.email }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    } finally { setLoading(false) }
  }

  const verifyOtp = async (email, otp) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp })
      setUser(data.user)
      localStorage.setItem('odisha_token', data.token)
      return { success: true, user: data.user, message: data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'OTP verification failed' }
    } finally { setLoading(false) }
  }

  const resendOtp = async (email) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/resend-otp', { email })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend OTP' }
    } finally { setLoading(false) }
  }

  const forgotPassword = async (email) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Request failed' }
    } finally { setLoading(false) }
  }

  const verifyResetOtp = async (email, otp) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { email, otp })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'OTP verification failed' }
    } finally { setLoading(false) }
  }

  const resetPassword = async (email, otp, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, password })
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed' }
    } finally { setLoading(false) }
  }

  const googleLogin = async (token) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/google-login', { token })
      setUser(data.user)
      localStorage.setItem('odisha_token', data.token)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google sign-in failed' }
    } finally { setLoading(false) }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.warn('Backend logout failed:', err.message)
    } finally {
      setUser(null)
      localStorage.removeItem('odisha_token')
      localStorage.removeItem('odisha_user')
    }
  }

  const updateUser = async (updatedData) => {
    setLoading(true)
    try {
      const { data } = await api.put('/auth/profile', updatedData)
      setUser(data)
      return { success: true, user: data }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Profile update failed' }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      verifyOtp, 
      resendOtp, 
      forgotPassword, 
      verifyResetOtp, 
      resetPassword, 
      googleLogin, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
