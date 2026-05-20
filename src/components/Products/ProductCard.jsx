import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const GRAIN_COLORS = {
  'p1': { grains: '#1a1a1a', glow: '#555', mark: 'rgba(255,255,255,0.7)', bowl: '#8B6914' },
  'p2': { grains: '#8B2014', glow: '#C04040', mark: 'rgba(255,180,180,0.6)', bowl: '#7B1A0A' },
  'p3': { grains: '#D4A800', glow: '#FFD700', mark: 'rgba(255,255,200,0.5)', bowl: '#8B7000' },
  'p4': { grains: '#D4830A', glow: '#FF9020', mark: 'rgba(255,220,160,0.5)', bowl: '#8B5010' },
  'p5': { grains: '#8B4513', glow: '#C06030', mark: 'rgba(255,200,160,0.5)', bowl: '#6B3010' },
  'p6': { grains: '#D4A800', glow: '#FFD040', mark: 'rgba(255,250,180,0.5)', bowl: '#9B7A00' },
  'p7': { grains: '#C8C8A0', glow: '#E0E0C0', mark: 'rgba(255,255,240,0.6)', bowl: '#8B8B70' },
  'p8': { grains: '#C04020', glow: '#E05040', mark: 'rgba(255,180,160,0.5)', bowl: '#902010' },
}

function ProductSVG({ product }) {
  const c = GRAIN_COLORS[product._id] || GRAIN_COLORS['p1']
  const grainPositions = [[160,148,15],[180,142,-8],[200,140,5],[220,144,-12],[238,150,8],[152,155,-3],[172,153,10],[196,151,-6],[216,154,14],[234,158,-4]]
  return (
    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id={`bg${product._id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={product.color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#060400" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id={`bowl${product._id}`} cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor={c.bowl}/>
          <stop offset="100%" stopColor="#2A1800"/>
        </radialGradient>
      </defs>
      <rect width="240" height="200" fill={`url(#bg${product._id})`}/>
      {/* Glow */}
      <ellipse cx="120" cy="110" rx="70" ry="50" fill={c.glow} opacity="0.05"/>
      {/* Pack */}
      <rect x="75" y="35" width="90" height="125" rx="14" fill="rgba(20,15,5,0.95)"/>
      <rect x="80" y="40" width="80" height="115" rx="12" fill="rgba(30,22,8,0.9)"/>
      {/* Gold band */}
      <rect x="75" y="68" width="90" height="22" rx="0" fill="#C8A951"/>
      <text x="120" y="83" textAnchor="middle" fontFamily="'Poppins',sans-serif" fontSize="7.5" fill="#111" fontWeight="700" letterSpacing="1.2">ODISHASHOP</text>
      {/* Inner label */}
      <rect x="84" y="94" width="72" height="46" rx="8" fill={c.bowl} opacity="0.25"/>
      <ellipse cx="120" cy="108" rx="22" ry="16" fill={c.grains} opacity="0.7"/>
      <ellipse cx="120" cy="106" rx="10" ry="7" fill={c.glow} opacity="0.25"/>
      <text x="120" y="132" textAnchor="middle" fontFamily="'Poppins',sans-serif" fontSize="8" fill="rgba(200,169,81,0.85)" letterSpacing="0.5" fontWeight="600">
        {product.shortName.toUpperCase()}
      </text>
      {/* Scattered grains */}
      <g fill={c.grains} opacity="0.88">
        {grainPositions.map(([cx,cy,rot],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="5.5" ry="4" transform={`rotate(${rot},${cx},${cy})`}/>
        ))}
      </g>
      <g fill={c.mark}>
        {[[160,146],[200,138],[238,148],[180,140]].map(([cx,cy],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx="2.2" ry="1.4"/>
        ))}
      </g>
      {/* Bowl at base */}
      <path d="M28 176 Q120 206 212 176 L207 171 Q120 199 33 171 Z" fill={`url(#bowl${product._id})`} opacity="0.8"/>
      <ellipse cx="120" cy="171" rx="90" ry="12" fill={c.bowl} opacity="0.35"/>
    </svg>
  )
}

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [added, setAdded] = useState(false)
  const wishlisted = isWishlisted(product._id)

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(product)
    setAdded(true)
    toast.success(`${product.shortName} added to cart!`, {
      style: { background: '#111', color: '#fff', border: '1px solid #C8A951' },
      iconTheme: { primary: '#C8A951', secondary: '#111' }
    })
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product)
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
      style: { background: '#111', color: '#fff', border: '1px solid #C8A951' }
    })
  }

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300 relative group">
      {product.badge && (
        <div className="absolute top-3 left-3 z-10 bg-gold text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          {product.badge}
        </div>
      )}
      <button onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-400'}`}>
        <FiHeart size={14} fill={wishlisted ? 'currentColor' : 'none'}/>
      </button>

      <Link to={`/product/${product._id}`}>
        <div className="h-[200px] overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ProductSVG product={product}/>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-bold text-[15px] text-black mb-1 hover:text-gold transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_,i) => (
            <FiStar key={i} size={12} fill={i < Math.floor(product.rating) ? '#C8A951' : 'none'} stroke="#C8A951"/>
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-extrabold text-black">₹{product.price}</span>
          <span className="text-xs text-gray-400 font-medium">/ {product.weight}</span>
        </div>
        <button onClick={handleAdd}
          className={`w-full border font-bold text-xs tracking-widest uppercase py-3 rounded-xl transition-all duration-300 ${added ? 'bg-gold text-black border-gold' : 'bg-black text-gold border-gold hover:bg-gold hover:text-black'}`}>
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  )
}
