import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiStar, FiHeart, FiShoppingCart, FiArrowLeft, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Products/ProductCard'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let active = true
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/products/${id}`)
        if (!active) return
        setProduct(data)
        
        // Fetch related products efficiently by category
        const { data: relatedData } = await api.get(`/products?category=${data.category}&limit=5`)
        if (!active) return
        const products = relatedData.products || relatedData
        const relatedProducts = products.filter(p => p._id !== id).slice(0, 4)
        setRelated(relatedProducts)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        if (active) toast.error('Product not found')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProduct()
    return () => { active = false }
  }, [id])

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product)
    toast.success(`${qty}x ${product.shortName} added to cart!`, {
      style: { background: '#111', color: '#fff', border: '1px solid #C8A951' },
      iconTheme: { primary: '#C8A951', secondary: '#111' }
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <div>
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold">Loading product...</h2>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <div>
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-3">Product not found</h2>
        <Link to="/shop" className="btn-gold">Back to Shop</Link>
      </div>
    </div>
  )
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm mb-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden aspect-square max-h-[460px]"
            style={{ background: 'linear-gradient(135deg, #1a1200, #0d0d0d)' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#111"/>
                <ellipse cx="200" cy="200" rx="130" ry="80" fill="rgba(200,169,81,0.06)"/>
                <rect x="140" y="80" width="120" height="200" rx="20" fill="#1a1208"/>
                <rect x="148" y="88" width="104" height="184" rx="16" fill="#222"/>
                <rect x="140" y="135" width="120" height="35" fill="#C8A951"/>
                <text x="200" y="157" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill="#111" fontWeight="700" letterSpacing="1.5">ODISHASHOP</text>
                <rect x="152" y="175" width="96" height="70" rx="12" fill={product.color} opacity="0.3"/>
                <ellipse cx="200" cy="205" rx="32" ry="24" fill={product.accent} opacity="0.7"/>
                <text x="200" y="237" textAnchor="middle" fontFamily="Poppins" fontSize="11" fill="rgba(200,169,81,0.9)" letterSpacing="1" fontWeight="600">
                  {product.shortName.toUpperCase()}
                </text>
                <path d="M70 300 Q200 340 330 300 L320 290 Q200 328 80 290 Z" fill="#8B6914" opacity="0.7"/>
                <ellipse cx="200" cy="290" rx="125" ry="18" fill="#9A7020" opacity="0.4"/>
              </svg>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-between">
            <div>
              {product.badge && (
                <span className="inline-block bg-gold text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">{product.badge}</span>
              )}
              <h1 className="font-extrabold text-black text-3xl mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_,i) => (
                    <FiStar key={i} size={14} fill={i < Math.floor(product.rating) ? '#C8A951' : 'none'} stroke="#C8A951"/>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} ({product.reviews} reviews)</span>
              </div>
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-4xl font-extrabold text-black">₹{product.price}</span>
                <span className="text-gray-400 text-sm">/ {product.weight}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400"/>
                <span className="text-sm text-gray-500">{product.stock} units in stock</span>
              </div>

              {/* Qty + Add */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-black/10 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-4 py-3 hover:bg-gold/10 transition-colors text-gray-500 font-bold">−</button>
                  <span className="px-5 py-3 font-bold text-black border-x border-black/10">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="px-4 py-3 hover:bg-gold/10 transition-colors text-gray-500 font-bold">+</button>
                </div>
                <button onClick={handleAdd} className="flex-1 btn-gold rounded-xl py-3.5 flex items-center justify-center gap-2">
                  <FiShoppingCart size={16}/> Add to Cart
                </button>
              </div>
              <button onClick={() => toggleWishlist(product)}
                className={`w-full border py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isWishlisted(product._id) ? 'border-red-400 text-red-400 bg-red-50' : 'border-black/10 text-gray-500 hover:border-gold hover:text-gold'}`}>
                <FiHeart size={15} fill={isWishlisted(product._id) ? 'currentColor' : 'none'}/>
                {isWishlisted(product._id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-black/6">
              {[
                [<FiTruck size={16}/>, 'Free shipping above ₹499'],
                [<FiShield size={16}/>, '100% pure & natural'],
                [<FiRefreshCw size={16}/>, '7 day easy returns'],
              ].map(([icon, label], i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 bg-cream rounded-xl">
                  <span className="text-gold">{icon}</span>
                  <span className="text-[10.5px] text-gray-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-black mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
