import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

export default function CartSidebar({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, cartTotal, cartCount } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#111] z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/20">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="text-gold" size={20}/>
                <span className="text-white font-bold text-lg tracking-wide">Your Cart</span>
                {cartCount > 0 && (
                  <span className="bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                )}
              </div>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
                <FiX size={22}/>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                  <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <FiShoppingBag size={32} className="text-gold/40"/>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Your cart is empty</p>
                    <p className="text-white/30 text-xs">Add some products to get started</p>
                  </div>
                  <button onClick={onClose}>
                    <Link to="/shop" className="btn-gold text-sm px-6 py-2.5">Shop Now</Link>
                  </button>
                </div>
              ) : cartItems.map(item => (
                <motion.div key={item._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 hover:border-gold/25 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1200]">
                    <svg viewBox="0 0 64 64" className="w-full h-full">
                      <rect width="64" height="64" fill="#1a1200"/>
                      <ellipse cx="32" cy="36" rx="18" ry="12" fill="#8B6914" opacity="0.7"/>
                      <ellipse cx="32" cy="34" rx="8" ry="5" fill={item.accent || '#C8A951'} opacity="0.5"/>
                      <rect x="18" y="22" width="28" height="8" rx="1" fill="#C8A951"/>
                      <text x="32" y="29" textAnchor="middle" fontFamily="Poppins" fontSize="5" fill="#111" fontWeight="700">ODISHA</text>
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-white/40 text-xs mb-2">{item.weight}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-1 py-0.5">
                        <button onClick={() => updateQty(item._id, item.qty - 1)}
                          className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-gold transition-colors">
                          <FiMinus size={12}/>
                        </button>
                        <span className="text-white text-sm font-bold w-5 text-center">{item.qty}</span>
                        <button 
                          disabled={item.stock !== undefined && item.qty >= item.stock}
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          className={`w-6 h-6 flex items-center justify-center transition-colors ${
                            item.stock !== undefined && item.qty >= item.stock 
                              ? 'text-white/10 cursor-not-allowed' 
                              : 'text-white/60 hover:text-gold'
                          }`}
                        >
                          <FiPlus size={12}/>
                        </button>
                      </div>
                      <span className="text-gold font-extrabold text-sm">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)}
                    className="text-white/25 hover:text-red-400 transition-colors self-start mt-1 p-1">
                    <FiTrash2 size={15}/>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-6 py-5 border-t border-gold/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Subtotal</span>
                  <span className="text-white text-lg font-extrabold">₹{cartTotal}</span>
                </div>
                {cartTotal < 499 && (
                  <div className="bg-gold/10 border border-gold/20 rounded-xl px-4 py-2.5 text-xs text-gold/80 text-center">
                    Add ₹{499 - cartTotal} more for FREE shipping 🚚
                  </div>
                )}
                <Link to="/checkout" onClick={onClose}
                  className="btn-gold w-full text-center block py-3.5 rounded-xl text-sm">
                  Proceed to Checkout
                </Link>
                <button onClick={onClose} className="w-full text-white/40 text-xs hover:text-white/70 transition-colors py-1">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
