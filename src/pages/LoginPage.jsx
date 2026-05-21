import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowLeft, FiShield, FiClock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, googleLogin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Detect mode from URL
  // Paths supported: /login, /verify-otp, /forgot-password, /reset-password
  const [mode, setMode] = useState('login')
  const [tab, setTab] = useState('login') // 'login' or 'register' inside /login

  useEffect(() => {
    const path = location.pathname
    if (path === '/verify-otp') setMode('verify-otp')
    else if (path === '/forgot-password') setMode('forgot-password')
    else if (path === '/reset-password') setMode('reset-password')
    else {
      setMode('login')
      // Reset email or other states if needed
    }
  }, [location.pathname])

  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  // OTP state
  const [otpCode, setOtpCode] = useState('')
  const [otpEmail, setOtpEmail] = useState(() => {
    return location.state?.email || localStorage.getItem('odisha_otp_email') || ''
  })

  // Timer for Resend OTP
  const [timer, setTimer] = useState(0)

  const [errors, setErrors] = useState({ email: '', password: '', otp: '' })

  useEffect(() => {
    setErrors({ email: '', password: '', otp: '' })
  }, [tab, mode])

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Save email to local storage if it changes so user doesn't lose it on refresh
  useEffect(() => {
    if (otpEmail) {
      localStorage.setItem('odisha_otp_email', otpEmail)
    }
  }, [otpEmail])

  // --- Google OAuth Integration ---
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.head.appendChild(script)
    }

    const initializeGoogle = () => {
      if (!window.google) return
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com'

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      })

      // Render button if we are on the login screen
      const btnDiv = document.getElementById('googleSignInBtn')
      if (btnDiv && mode === 'login') {
        const btnWidth = window.innerWidth < 440 ? window.innerWidth - 90 : 380;
        window.google.accounts.id.renderButton(btnDiv, {
          type: 'standard',
          theme: 'dark',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: btnWidth
        })
      }
    }

    const handleGoogleResponse = async (response) => {
      const toastId = toast.loading('Authenticating with Google...')
      const res = await googleLogin(response.credential)
      if (res.success) {
        toast.success('Welcome to OdishaShop!', { id: toastId })
        if (res.user?.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        toast.error(res.message, { id: toastId })
      }
    }

    // Load/re-initialize Google whenever mode changes to 'login' or tab changes
    if (mode === 'login') {
      loadGoogleScript()
    }
  }, [mode, tab])

  // --- Form Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setErrors({ email: '', password: '', otp: '' })

    if (mode === 'login') {
      if (tab === 'login') {
        // Login
        const res = await login(form.email, form.password)
        if (res.success) {
          toast.success('Welcome back!')
          if (res.user?.role === 'admin') navigate('/admin')
          else navigate('/')
        } else {
          if (res.message.includes('registered')) {
            setErrors(errs => ({ ...errs, email: 'Your email has not been registered. Please create an account.' }))
          } else if (res.message === 'Invalid email or password') {
            setErrors(errs => ({ ...errs, password: 'Invalid email or password' }))
          } else {
            toast.error(res.message)
          }
          if (res.message.includes('verify')) {
            setOtpEmail(form.email)
            toast.loading('Sending OTP...', { id: 'otp-send' })
            const otpRes = await resendOtp(form.email)
            if (otpRes.success) {
              toast.success('A new OTP has been sent to your email.', { id: 'otp-send' })
              setTimer(60)
            } else if (otpRes.message.includes('wait 60 seconds')) {
              toast.success('Please check your email. An OTP was already sent recently.', { id: 'otp-send' })
            } else {
              toast.error(otpRes.message, { id: 'otp-send' })
            }
            navigate('/verify-otp', { state: { email: form.email } })
          }
        }
      } else {
        // Register
        if (form.password.length < 6) {
          return setErrors(errs => ({ ...errs, password: 'Password must be minimum 6 characters' }))
        }
        const res = await register(form.name, form.email, form.password)
        if (res.success) {
          toast.success(res.message || 'OTP sent to your email!')
          setOtpEmail(form.email)
          setTimer(60) // Start resend timer
          navigate('/verify-otp', { state: { email: form.email } })
        } else {
          if (res.message === 'Email already registered') {
            setErrors(errs => ({ ...errs, email: 'Your email has been registered, please log in' }))
          } else {
            toast.error(res.message)
          }
        }
      }
    } else if (mode === 'verify-otp') {
      if (!otpEmail) return toast.error('Email address is missing')
      if (otpCode.length !== 4) return setErrors(errs => ({ ...errs, otp: 'Please enter the 4-digit OTP code' }))

      const res = await verifyOtp(otpEmail, otpCode)
      if (res.success) {
        toast.success('Email verified successfully! Welcome!')
        if (res.user?.role === 'admin') navigate('/admin')
        else navigate('/')
      } else {
        setErrors(errs => ({ ...errs, otp: res.message || 'Invalid OTP code' }))
      }
    } else if (mode === 'forgot-password') {
      const res = await forgotPassword(form.email)
      if (res.success) {
        toast.success('Reset OTP sent to your email!')
        setOtpEmail(form.email)
        setTimer(60) // Start resend timer
        navigate('/reset-password', { state: { email: form.email } })
      } else {
        toast.error(res.message)
      }
    } else if (mode === 'reset-password') {
      if (!otpEmail) return toast.error('Email address is missing')
      if (otpCode.length !== 4) return toast.error('Please enter the 4-digit reset OTP code')
      if (form.password.length < 6) return toast.error('Password must be minimum 6 characters')
      if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')

      const res = await resetPassword(otpEmail, otpCode, form.password)
      if (res.success) {
        toast.success('Password reset successfully! Please login.')
        setForm({ name: '', email: otpEmail, password: '', confirmPassword: '' })
        setTab('login')
        navigate('/login')
      } else {
        toast.error(res.message)
      }
    }
  }

  const handleResendOtp = async () => {
    if (!otpEmail) return toast.error('Email is missing')
    setTimer(60)
    const res = await resendOtp(otpEmail)
    if (res.success) {
      toast.success('A new OTP has been sent to your email.')
    } else {
      toast.error(res.message)
    }
  }

  const handleForgotResendOtp = async () => {
    if (!otpEmail) return toast.error('Email is missing')
    setTimer(60)
    const res = await forgotPassword(otpEmail)
    if (res.success) {
      toast.success('A new reset OTP has been sent to your email.')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-5 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(200,169,81,0.07)_0%,transparent_70%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

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

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <AnimatePresence mode="wait">

            {/* VIEW 1: LOGIN & REGISTER */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {/* Tabs */}
                <div className="flex rounded-xl bg-white/5 p-1 mb-7">
                  {['login', 'register'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/50 hover:text-white'}`}>
                      {t === 'login' ? 'Login' : 'Register'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {tab === 'register' && (
                    <div>
                      <label className="text-white/60 text-xs font-medium block mb-1.5">Full Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input type="text" required placeholder="Your full name"
                          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type="email" required placeholder="you@example.com"
                        value={form.email} onChange={e => {
                          setForm(f => ({ ...f, email: e.target.value }));
                          setErrors(errs => ({ ...errs, email: '' }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 font-semibold mt-1.5 pl-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                        value={form.password} onChange={e => {
                          setForm(f => ({ ...f, password: e.target.value }));
                          setErrors(errs => ({ ...errs, password: '' }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 font-semibold mt-1.5 pl-1">{errors.password}</p>
                    )}
                    {tab === 'register' && (
                      <p className="text-[10px] text-white/40 mt-1.5">Password must be at least 6 characters long.</p>
                    )}
                  </div>

                  {tab === 'login' && (
                    <div className="text-right">
                      <Link to="/forgot-password" className="text-gold/70 text-xs hover:text-gold transition-colors">Forgot password?</Link>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Please wait...' : tab === 'login' ? 'Login to Account' : 'Create Account'}
                  </button>
                </form>

                {/* Continue with Google */}
                <div className="relative my-6 flex items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-4 text-white/30 text-xs uppercase tracking-wider font-bold">Or Continue With</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="flex justify-center w-full overflow-hidden">
                  <div id="googleSignInBtn" className="flex justify-center w-full"></div>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                  {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} className="text-gold hover:underline font-semibold">{tab === 'login' ? 'Register' : 'Login'}</button>
                </p>
              </motion.div>
            )}

            {/* VIEW 2: OTP VERIFICATION */}
            {mode === 'verify-otp' && (
              <motion.div key="verify-otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Link to="/login" className="text-white/40 hover:text-gold transition-colors">
                    <FiArrowLeft size={18} />
                  </Link>
                  <h3 className="font-extrabold text-xl text-white">Email Verification</h3>
                </div>

                <p className="text-white/60 text-xs leading-relaxed">
                  We have sent a 4-digit verification code to <strong className="text-gold">{otpEmail || 'your email'}</strong>. Please enter it below.
                </p>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">Verification Code</label>
                    <div className="relative">
                      <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type="text" required placeholder="Enter your OTP" maxLength={4}
                        value={otpCode} onChange={e => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          setErrors(errs => ({ ...errs, otp: '' }));
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-center text-white text-sm font-semibold placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    {errors.otp && (
                      <p className="text-xs text-red-500 font-semibold mt-1.5 text-center">{errors.otp}</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                    {loading ? 'Verifying OTP...' : 'Verify & Log In'}
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-white/40 flex items-center gap-1.5">
                    <FiClock size={12} />
                    {timer > 0 ? `Resend in ${timer}s` : 'Ready to resend'}
                  </span>
                  <button onClick={handleResendOtp} disabled={timer > 0 || loading}
                    className="text-gold font-bold hover:underline disabled:opacity-30 disabled:no-underline">
                    Resend Code
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {mode === 'forgot-password' && (
              <motion.div key="forgot-password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Link to="/login" className="text-white/40 hover:text-gold transition-colors">
                    <FiArrowLeft size={18} />
                  </Link>
                  <h3 className="font-extrabold text-xl text-white">Forgot Password</h3>
                </div>

                <p className="text-white/60 text-xs leading-relaxed">
                  Enter your registered email address and we'll send you an OTP to reset your password.
                </p>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type="email" required placeholder="you@example.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                    {loading ? 'Please wait...' : 'Send OTP Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* VIEW 4: RESET PASSWORD */}
            {mode === 'reset-password' && (
              <motion.div key="reset-password" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Link to="/forgot-password" className="text-white/40 hover:text-gold transition-colors">
                    <FiArrowLeft size={18} />
                  </Link>
                  <h3 className="font-extrabold text-xl text-white">Reset Password</h3>
                </div>

                <p className="text-white/60 text-xs leading-relaxed">
                  OTP sent to <span className="text-gold">{otpEmail || 'your email'}</span>. Please enter the OTP code and your new password.
                </p>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">4-Digit OTP Code</label>
                    <div className="relative">
                      <FiShield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type="text" required placeholder="Enter your OTP" maxLength={4}
                        value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-center text-white text-sm font-semibold placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-xs font-medium block mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <input type={show ? 'text' : 'password'} required placeholder="••••••••"
                        value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50">
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-white/40 flex items-center gap-1.5">
                    <FiClock size={12} />
                    {timer > 0 ? `Resend in ${timer}s` : 'Ready to resend'}
                  </span>
                  <button onClick={handleForgotResendOtp} disabled={timer > 0 || loading}
                    className="text-gold font-bold hover:underline disabled:opacity-30 disabled:no-underline">
                    Resend OTP
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-[11px] mt-5">
          By continuing you agree to our{' '}
          <Link to="/story" className="text-gold/50 hover:text-gold">Story</Link> &{' '}
          <Link to="/shop" className="text-gold/50 hover:text-gold">Products</Link>
        </p>
      </motion.div>
    </div>
  )
}
