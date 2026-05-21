import { useState, useMemo, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import ProductCard from '../components/Products/ProductCard'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([{ categoryName: 'All' }, { categoryName: 'Rice' }, { categoryName: 'Dal' }])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('default')

  useEffect(() => {
    let active = true
    
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories')
        if (data && data.length > 0) {
          const fullCats = [{ categoryName: 'All' }, ...data]
          if (active) setCategories(fullCats)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/products')
        if (!active) return
        setProducts(data.products || data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        if (active) toast.error('Failed to load products')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchCategories()
    fetchProducts()
    
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (category !== 'All') list = list.filter(p => p.category === category)
    if (search.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [products, search, category, sort])

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-[#111] px-5 lg:px-[7%] py-16 text-center">
        <div className="text-gold text-xs font-bold tracking-[4px] uppercase mb-3">Our Collection</div>
        <h1 className="text-white font-extrabold mb-3" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>Shop All Products</h1>
        <p className="text-white/50 text-sm max-w-md mx-auto">100% pure, authentic Odia agricultural products sourced directly from local farmers.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-black/8 px-5 lg:px-[7%] py-5 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-[70px] z-40 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {categories.map(c => (
              <button key={c.categoryName} onClick={() => setCategory(c.categoryName)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${category === c.categoryName ? 'bg-gold text-black shadow-md' : 'bg-black/5 text-black/60 hover:bg-gold/20 hover:text-black'}`}>
                {c.categoryImage && (
                  <img src={c.categoryImage} alt={c.categoryName} className="w-5 h-5 rounded-full object-cover border border-black/10 bg-white" />
                )}
                {c.categoryName}
              </button>
            ))}
          </div>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="pl-3 pr-8 py-2 border border-black/10 rounded-xl text-xs font-medium focus:outline-none focus:border-gold cursor-pointer bg-white">
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="px-5 lg:px-[7%] py-12">
        {loading ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-black mb-2">Loading products...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No products found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-xs mb-6">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
