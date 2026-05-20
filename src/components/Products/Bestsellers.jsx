import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import api from '../../api/axios'

export default function Bestsellers() {
  const ref = useRef(null)
  const [bestsellers, setBestsellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/products?limit=4')
        if (!active) return
        setBestsellers(data.products || data)
      } catch (error) {
        console.error('Failed to fetch bestsellers:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchProducts()
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
  }, [bestsellers])

  return (
    <section className="bg-cream px-5 lg:px-[7%] py-20 md:py-24" id="bestsellers" ref={ref}>
      <div className="section-label">Our Bestsellers</div>
      <h2 className="section-title">Shop Our Bestsellers</h2>
      <div className="section-divider" />

      {loading ? (
        <div className="text-center py-12">Loading bestsellers...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {bestsellers.map((p, i) => (
              <div key={p._id} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/shop" className="btn-gold">View All Products</Link>
          </div>
        </>
      )}
    </section>
  )
}
