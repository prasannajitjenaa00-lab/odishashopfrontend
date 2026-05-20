import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('odisha_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('odisha_token')
      localStorage.removeItem('odisha_user')
      
      // Prevent aggressive redirects on guest-friendly public routes
      const protectedPaths = ['/checkout', '/account', '/admin']
      const currentPath = window.location.pathname
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
