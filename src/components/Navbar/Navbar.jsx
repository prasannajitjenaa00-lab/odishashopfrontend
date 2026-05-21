import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiUser, FiShoppingCart, FiMoreVertical, FiX, FiHeart } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/story' },
  { label: 'Blog', to: '/blogs' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar({ onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount, wishlist } = useCart()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gold text-black text-xs font-semibold py-2.5 text-center tracking-wide flex items-center justify-center gap-2">
        <span>🚚</span>
        <span><strong>FREE SHIPPING</strong> on orders above ₹499 &nbsp;|&nbsp; 100% Pure & Natural from Odisha Farms</span>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 bg-[#111] border-b border-gold/20 transition-all duration-300 ${scrolled ? 'shadow-[0_4px_30px_rgba(200,169,81,0.15)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[70px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="ODISHASHOP" className="w-10 h-10 object-contain rounded-full border border-gold/30 p-0.5 bg-white/5" />
            <div>
              <div className="text-gold font-extrabold text-lg tracking-wider leading-none">ODISHASHOP</div>
              <div className="text-gold/50 text-[9px] tracking-[2px] uppercase">Premium Quality, Honest Price</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden lg:flex gap-8 list-none">
            {links.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={`text-sm font-medium transition-colors duration-200 relative group ${pathname === l.to ? 'text-gold' : 'text-white hover:text-gold'}`}>
                  {l.label}
                  <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-gold transition-all duration-300 ${pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <Link to="/shop" className="text-white hover:text-gold transition-colors p-1">
              <FiSearch size={20} />
            </Link>
            <Link to={user ? '/account' : '/login'} className="hidden lg:inline-flex text-white hover:text-gold transition-colors p-1">
              <FiUser size={20} />
            </Link>
            <Link to="/wishlist" className="hidden lg:inline-flex text-white hover:text-gold transition-colors p-1 relative">
              <FiHeart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-gold text-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button onClick={onCartOpen} className="hidden lg:inline-flex text-white hover:text-gold transition-colors p-1 relative">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-gold text-black rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="lg:hidden text-white hover:text-gold p-1" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <FiX size={24} /> : <FiMoreVertical size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden border-t border-gold/20 bg-[#111]"
            >
              <div className="px-5 py-4 flex flex-col gap-0">
                {links.map(l => (
                  <Link key={l.to} to={l.to}
                    className={`py-4 border-b border-white/5 text-sm font-medium flex justify-between items-center transition-colors ${pathname === l.to ? 'text-gold' : 'text-white hover:text-gold'}`}>
                    {l.label} <span className="opacity-40">›</span>
                  </Link>
                ))}
                <Link to={user ? '/account' : '/login'}
                  className="py-4 border-b border-white/5 text-sm font-medium flex justify-between items-center text-white hover:text-gold transition-colors">
                  {user ? 'Account' : 'Login'} <FiUser size={18} />
                </Link>
                <Link to="/wishlist"
                  className="py-4 border-b border-white/5 text-sm font-medium flex justify-between items-center text-white hover:text-gold transition-colors">
                  Wishlist
                  <span className="flex items-center gap-2">
                    <FiHeart size={18} />
                    {wishlist.length > 0 && (
                      <span className="bg-gold text-black rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </span>
                </Link>
                <button onClick={() => { onCartOpen(); setMenuOpen(false) }}
                  className="py-4 border-b border-white/5 text-left text-sm font-medium flex justify-between items-center text-white hover:text-gold transition-colors">
                  Cart
                  <span className="flex items-center gap-2">
                    <FiShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="bg-gold text-black rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </button>
                {user
                  ? <button onClick={() => { logout(); setMenuOpen(false) }} className="mt-4 btn-gold text-center rounded-xl">Logout</button>
                  : null
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
