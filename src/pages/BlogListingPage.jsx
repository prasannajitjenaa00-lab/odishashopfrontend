import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const CATEGORIES = [
  'All',
  'Odisha Authentic Foods',
  'Gota Biri Recipes',
  'Odisha Farming Culture',
  'Traditional Odisha Food',
  'Healthy Dal Benefits',
  'Red Rice Benefits',
  'Village Farming Stories',
  'Odisha Organic Products',
  'Food Recipes',
  'Farmer Stories'
]

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filtering & Pagination States
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // Dynamic document title for SEO
    document.title = selectedCategory === 'All' 
      ? 'Odisha Journal — Recipes, Farming, and Foods | OdishaShop'
      : `${selectedCategory} - OdishaShop Journal`
  }, [selectedCategory])

  const fetchBlogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/blogs', {
        params: {
          category: selectedCategory,
          search: searchQuery,
          page,
          limit: 9
        }
      })
      setBlogs(data.blogs || [])
      setTotalPages(data.pages || 1)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to retrieve articles. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [selectedCategory, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchBlogs()
  }

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Dynamic SEO Meta Title Tag */}
      <title>Odisha authentic food, culture, farming, and traditional products Journal | OdishaShop</title>
      
      {/* Inner Hero Header */}
      <div className="bg-[#111] py-16 md:py-24 text-center px-5 border-b border-gold/10 relative overflow-hidden">
        {/* Subtle decorative gold gradient rings or shapes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,81,0.08)_0,transparent_60%)] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-gold font-bold text-xs uppercase tracking-[0.25em] block mb-3">OdishaShop Journal</span>
          <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-wide uppercase">
            Our Farming &amp; Food Culture
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-4 max-w-xl mx-auto font-medium leading-relaxed">
            Discover ancient recipes, sustainable village farming secrets, health benefits of unpolished organic grains, and heartwarming grower stories from rural Odisha.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-[7%] pt-16">

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold mb-3" />
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Harvesting Stories...</p>
          </div>
        )}

        {/* Error Handling */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="font-bold text-sm mb-4">{error}</p>
            <button
              onClick={fetchBlogs}
              className="btn-gold py-2 px-4 rounded-xl text-xs uppercase"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && (
          <>
            {blogs.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-black/5 shadow-sm max-w-lg mx-auto my-12">
                <span className="text-5xl mb-4 block">🌾</span>
                <h3 className="font-extrabold text-lg text-black mb-2">No Articles Found</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  We couldn't find any journals under "{selectedCategory}" matching your criteria. Try adjusting your search query or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All')
                    setSearchQuery('')
                    setPage(1)
                  }}
                  className="btn-gold py-2 px-4 rounded-xl text-xs uppercase"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white rounded-3xl overflow-hidden border border-black/5 flex flex-col justify-between hover:shadow-xl hover:border-gold/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative overflow-hidden aspect-video bg-black/10">
                        <img
                          src={b.image || '/logo.png'}
                          alt={b.title}
                          className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-[#111] text-gold border border-gold/30 text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md">
                          {b.category}
                        </div>
                      </div>
                      
                      <div className="p-6 text-left">
                        <div className="flex items-center gap-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2.5">
                          <span>{b.author || 'OdishaShop'}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>
                            {new Date(b.publishDate || b.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <h3 className="text-black font-extrabold text-lg line-clamp-2 hover:text-gold transition-colors duration-200 mb-3 leading-snug">
                          <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                        </h3>
                        
                        <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                          {b.shortDescription}
                        </p>
                      </div>
                    </div>
                    
                    <div className="px-6 pb-6 pt-2 text-left border-t border-black/4">
                      <Link
                        to={`/blog/${b.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-gold tracking-widest uppercase transition-all duration-200"
                      >
                        Read Full Article <span className="text-gold">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${
                    page === 1
                      ? 'border-black/5 text-gray-300 bg-black/2 cursor-not-allowed'
                      : 'border-black/10 bg-white text-black hover:border-gold hover:text-gold'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-xs font-extrabold text-gray-600">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${
                    page === totalPages
                      ? 'border-black/5 text-gray-300 bg-black/2 cursor-not-allowed'
                      : 'border-black/10 bg-white text-black hover:border-gold hover:text-gold'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
