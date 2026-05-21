import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiStar, FiHeart, FiShoppingCart, FiArrowLeft, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Products/ProductCard'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function ProductPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart, toggleWishlist, isWishlisted } = useCart()
  const [qty, setQty] = useState(1)

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [hoverStar, setHoverStar] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) return toast.error('Please write some feedback')
    
    setSubmittingReview(true)
    const toastId = toast.loading('Submitting review...')
    try {
      await api.post(`/products/${id}/reviews`, reviewForm)
      toast.success('Thank you for your feedback!', { id: toastId })
      
      setReviewForm({ rating: 5, comment: '' })
      
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit review', { id: toastId })
    } finally {
      setSubmittingReview(false)
    }
  }

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
    if (product.stock <= 0) return
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-5 sm:p-8 shadow-sm mb-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden aspect-square max-h-[460px] relative"
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
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <span className="bg-red-600 text-white text-xs font-black tracking-widest uppercase px-5 py-2.5 rounded-xl shadow-lg border border-red-500/20 animate-pulse">
                  OUT OF STOCK
                </span>
              </div>
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
                <span className="text-sm text-gray-500">{product.rating?.toFixed(1) || '0.0'} ({product.reviews?.length || 0} reviews)</span>
              </div>
              <div className="mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-black">₹{product.price}</span>
                  {product.discountPercent > 0 && (
                    <span className="text-lg text-green-600 font-bold tracking-wide">{product.discountPercent}% OFF</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {product.discountPercent > 0 && (
                    <span className="text-lg text-gray-400 font-medium line-through">₹{product.originalPrice}</span>
                  )}
                  <span className="text-gray-400 text-sm">/ {product.weight}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Stock */}
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-400"/>
                  <span className="text-sm text-gray-500">{product.stock} units in stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                  <span className="text-sm font-extrabold text-red-600 uppercase tracking-wider">Out of Stock</span>
                </div>
              )}

              {/* Qty + Add */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-black/10 rounded-xl overflow-hidden bg-white">
                  <button 
                    disabled={product.stock <= 0 || qty <= 1}
                    onClick={() => setQty(q => Math.max(1, q-1))} 
                    className={`px-4 py-3 hover:bg-gold/10 transition-colors text-gray-500 font-bold ${product.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    −
                  </button>
                  <span className="px-5 py-3 font-bold text-black border-x border-black/10">
                    {product.stock <= 0 ? 0 : qty}
                  </span>
                  <button 
                    disabled={product.stock <= 0 || qty >= product.stock}
                    onClick={() => setQty(q => Math.min(product.stock, q+1))} 
                    className={`px-4 py-3 hover:bg-gold/10 transition-colors text-gray-500 font-bold ${product.stock <= 0 || qty >= product.stock ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    +
                  </button>
                </div>
                <button 
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className={`flex-1 rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                    product.stock <= 0 
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                      : 'btn-gold'
                  }`}
                >
                  <FiShoppingCart size={16}/> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
              <button onClick={() => toggleWishlist(product)}
                className={`w-full border py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${isWishlisted(product._id) ? 'border-red-400 text-red-400 bg-red-50' : 'border-black/10 text-gray-500 hover:border-gold hover:text-gold'}`}>
                <FiHeart size={15} fill={isWishlisted(product._id) ? 'currentColor' : 'none'}/>
                {isWishlisted(product._id) ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-black/6">
              {[
                [<FiTruck size={16}/>, 'Free shipping above ₹499'],
                [<FiShield size={16}/>, '100% pure & natural'],
              ].map(([icon, label], i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 bg-cream rounded-xl">
                  <span className="text-gold">{icon}</span>
                  <span className="text-[10.5px] text-gray-500 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm mb-12 border border-black/5">
          <h2 className="text-xl font-bold text-black mb-6">Customer Reviews & Ratings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Stats overview */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-black/5 pb-8 lg:pb-0 lg:pr-8 flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <div className="text-5xl font-extrabold text-black mb-2">{product.rating?.toFixed(1) || '0.0'}</div>
                <div className="flex justify-center lg:justify-start gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={18} fill={i < Math.round(product.rating || 0) ? '#C8A951' : 'none'} stroke="#C8A951"/>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Based on {product.reviews?.length || 0} verified reviews</p>
              </div>
            </div>

            {/* Right Column: Reviews List */}
            <div className="lg:col-span-2 space-y-6 max-h-[350px] overflow-y-auto pr-2 text-left">
              {product.reviews?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No reviews yet. Be the first to share your feedback!</p>
                </div>
              ) : (
                product.reviews.map((r, index) => (
                  <div key={r._id || index} className="border-b border-black/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm text-black">{r.name}</div>
                      <div className="text-xs text-gray-400">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12} fill={i < r.rating ? '#C8A951' : 'none'} stroke="#C8A951"/>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Submission Form */}
          <div className="mt-10 pt-8 border-t border-black/5 text-left">
            <h3 className="font-extrabold text-base text-black mb-4">Write a Review</h3>
            
            {!user ? (
              <div className="bg-cream/40 rounded-2xl p-6 border border-black/5 text-center">
                <p className="text-sm text-gray-500 mb-4">You must be logged in to write a product review.</p>
                <Link to="/login" className="btn-gold text-xs px-6 py-2.5">Log In to Account</Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
                <div className="bg-gold/5 border border-gold/15 rounded-2xl p-4 text-xs text-gold-dark/80 mb-2 leading-relaxed">
                  📢 <strong>Eligibility Note:</strong> You can only submit a review if you have purchased this product and it has been successfully marked as <strong>Delivered</strong>.
                </div>
                
                {/* Clickable Star Rating */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Your Rating *</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        className="text-gold p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <FiStar
                          size={24}
                          fill={(hoverStar || reviewForm.rating) >= star ? '#C8A951' : 'none'}
                          stroke="#C8A951"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Your Written Feedback *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors resize-none bg-cream/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-gold py-3 px-8 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-black mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
