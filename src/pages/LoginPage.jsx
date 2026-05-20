import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    const res = tab === 'login'
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password)
    if (res.success) {
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!')
      if (res.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-5 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,169,81,0.07)_0%,transparent_70%)] pointer-events-none"/>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2.5">
            <img src="/logo.png" alt="ODISHASHOP" className="w-16 h-16 object-contain rounded-full border border-gold/30 p-1 bg-white/5" />
            <div>
              <div className="text-gold font-extrabold text-2xl tracking-wider leading-none">ODISHASHOP</div>
              <div className="text-white/30 text-[10px] tracking-[3px] uppercase mt-1.5">Premium Quality, Honest Price</div>
            </div>
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-7">
            {['login','register'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-gold text-black' : 'text-white/50 hover:text-white'}`}>
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-white/60 text-xs font-medium block mb-1.5">Full Name</label>
                <input type="text" required placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors"/>
              </div>
            )}
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors"/>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
                <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors"/>
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {show ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            {tab === 'login' && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-gold/70 text-xs hover:text-gold transition-colors">Forgot password?</Link>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full btn-gold py-3.5 rounded-xl text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Please wait...' : tab === 'login' ? 'Login to Account' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-5">
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} className="text-gold hover:underline">{tab === 'login' ? 'Register' : 'Login'}</button>
          </p>
        </div>

        <p className="text-center text-white/20 text-[11px] mt-5">
          By continuing you agree to our{' '}
          <Link to="/terms" className="text-gold/50 hover:text-gold">Terms</Link> &{' '}
          <Link to="/privacy" className="text-gold/50 hover:text-gold">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  )
}
