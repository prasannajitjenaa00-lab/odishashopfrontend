import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function BlogSection() {
  const ref = useRef(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchLatestBlogs = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/blogs?limit=3')
        if (!active) return
        setBlogs(data.blogs || data)
      } catch (error) {
        console.error('Failed to fetch latest blogs:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchLatestBlogs()
    return () => { active = false }
  }, [])

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const timeouts = []
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => e.target.classList.add('visible'), i * 120)
          timeouts.push(t)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.08 })
    els.forEach(el => obs.observe(el))
    return () => {
      obs.disconnect()
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [blogs])

  return (
    <section className="bg-white px-5 lg:px-[7%] py-20 md:py-24" id="latest-blogs" ref={ref}>
      <div className="section-label text-gold font-bold tracking-widest text-center mb-1">Our Journal</div>
      <h2 className="section-title text-center text-black font-extrabold text-3xl md:text-4xl">Latest From OdishaShop</h2>
      <div className="section-divider bg-gold mx-auto mt-3 mb-12 h-0.5 w-16" />

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {blogs.slice(0, 3).map((b, i) => (
              <div 
                key={b._id} 
                className="reveal bg-cream rounded-3xl overflow-hidden border border-black/5 flex flex-col justify-between hover:shadow-xl hover:border-gold/30 transition-all duration-300 transform hover:-translate-y-1"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div>
                  <div className="relative overflow-hidden aspect-video bg-black/10 group">
                    <img 
                      src={b.image || '/logo.png'} 
                      alt={b.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-[#111] text-gold border border-gold/30 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                      {b.category}
                    </div>
                  </div>
                  <div className="p-6 text-left">
                    <div className="text-[11px] text-gray-400 font-semibold mb-2.5">
                      {new Date(b.publishDate || b.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <h3 className="text-black font-extrabold text-lg line-clamp-2 hover:text-gold transition-colors duration-200 mb-3">
                      <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                      {b.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 text-left">
                  <Link 
                    to={`/blog/${b.slug}`} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-black hover:text-gold tracking-widest uppercase transition-colors"
                  >
                    Read More <span className="text-gold">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/blogs" className="btn-gold">Explore All Blogs</Link>
          </div>
        </>
      )}
    </section>
  )
}
