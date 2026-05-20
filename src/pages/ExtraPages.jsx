import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiPackage } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Products/ProductCard'
import { PRODUCTS } from '../api/data'
import { useAuth } from '../context/AuthContext'
import { FiHeart, FiUser, FiShoppingBag, FiSettings, FiLogOut } from 'react-icons/fi'

// ─── Order Success ──────────────────────────────────────────────────────────
export function OrderSuccessPage() {
  const orderId = `ORD${Date.now().toString().slice(-6)}`
  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-5 py-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center mx-auto mb-7">
          <FiCheckCircle className="text-gold" size={44}/>
        </div>
        <h1 className="text-white font-extrabold text-3xl mb-3">Order Placed! 🎉</h1>
        <p className="text-white/55 text-sm mb-2">Thank you for shopping with OdishaShop</p>
        <p className="text-gold text-xs font-bold tracking-widest mb-8">Order ID: #{orderId}</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            ['Estimated Delivery', '3–5 business days'],
            ['Tracking', 'SMS & Email notification'],
            ['Support', 'support@odisha.shop'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link to="/" className="flex-1 btn-outline-white text-center py-3 rounded-xl">Back to Home</Link>
          <Link to="/shop" className="flex-1 btn-gold text-center py-3 rounded-xl">Shop More</Link>
        </div>
      </motion.div>
    </div>
  )
}

// ─── 404 Page ────────────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-gold font-extrabold text-[120px] leading-none mb-4 opacity-20">404</div>
        <h1 className="text-3xl font-extrabold text-black mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-gold">Go Back Home</Link>
      </motion.div>
    </div>
  )
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
export function WishlistPage() {
  const { wishlist } = useCart()
  return (
    <div className="bg-cream min-h-screen px-5 lg:px-[7%] py-12">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="text-gold" size={24}/>
        <h1 className="font-extrabold text-2xl text-black">My Wishlist</h1>
        <span className="bg-gold text-black text-xs font-bold px-2.5 py-0.5 rounded-full">{wishlist.length}</span>
      </div>
      {wishlist.length === 0 ? (
        <div className="text-center py-24">
          <FiHeart className="text-gray-200 mx-auto mb-4" size={64}/>
          <h3 className="text-lg font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">Save items you love for later</p>
          <Link to="/shop" className="btn-gold">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(p => <ProductCard key={p._id} product={p}/>)}
        </div>
      )}
    </div>
  )
}

// ─── Account Page ─────────────────────────────────────────────────────────────
export function AccountPage() {
  const { user, logout } = useAuth()
  if (!user) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <div>
        <FiUser className="text-gray-300 mx-auto mb-4" size={56}/>
        <h2 className="text-xl font-bold mb-2">Please login to continue</h2>
        <Link to="/login" className="btn-gold mt-4 inline-block">Login / Register</Link>
      </div>
    </div>
  )
  return (
    <div className="bg-cream min-h-screen px-5 lg:px-[7%] py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
            <FiUser className="text-gold" size={28}/>
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-black">{user.name}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            [FiShoppingBag,'My Orders','0 orders'],
            [FiHeart,'Wishlist','0 saved items'],
            [FiSettings,'Settings','Manage profile'],
          ].map(([Icon, title, sub], i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 cursor-pointer hover:border-gold border border-transparent transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center"><Icon className="text-gold" size={18}/></div>
              <div><p className="font-semibold text-sm text-black">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
            </div>
          ))}
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm font-semibold transition-colors px-1">
          <FiLogOut size={16}/> Logout
        </button>
      </div>
    </div>
  )
}

// ─── Our Story Page ──────────────────────────────────────────────────────────
export function StoryPage() {
  return (
    <div className="bg-[#111] min-h-screen">
      <div className="px-5 lg:px-[7%] py-20 max-w-4xl mx-auto text-center">
        <div className="text-gold text-xs font-bold tracking-[4px] uppercase mb-4">Our Story</div>
        <h1 className="text-white font-extrabold mb-6" style={{ fontSize: 'clamp(32px,5vw,56px)' }}>
          Born from the Fields <span className="text-gold">of Odisha</span>
        </h1>
        <p className="text-white/55 text-sm leading-relaxed max-w-2xl mx-auto mb-16">
          OdishaShop was founded with a simple mission — to connect the incredible farmers of Odisha directly with consumers across India, cutting out middlemen and ensuring fair prices for both sides.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            ['🌾', '2022', 'Founded in a small village in Odisha with just 3 farmer partners.'],
            ['🚀', '2023', 'Expanded to 20+ farmers across 5 districts of Odisha.'],
            ['❤️', '2026', '5000+ happy customers across India and growing every day.'],
          ].map(([emoji, year, desc]) => (
            <div key={year} className="border border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-colors">
              <span className="text-3xl block mb-3">{emoji}</span>
              <div className="text-gold font-extrabold text-xl mb-2">{year}</div>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
