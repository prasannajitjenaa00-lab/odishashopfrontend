import { useEffect, useRef } from 'react'
import { FiStar } from 'react-icons/fi'
import { REVIEWS } from '../../api/data'

export default function Reviews() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const timeouts = []
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => e.target.classList.add('visible'), i * 150)
          timeouts.push(t)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => {
      obs.disconnect()
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <section className="bg-white px-5 lg:px-[7%] py-20 md:py-24" ref={ref}>
      <div className="section-label">What Our Customers Say</div>
      <h2 className="section-title">Customer Reviews</h2>
      <div className="section-divider"/>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {REVIEWS.map((r, i) => (
          <div key={r.id} className="reveal border border-black/8 rounded-2xl p-9 relative transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5" style={{ transitionDelay: `${i * 0.12}s` }}>
            <span className="absolute top-4 right-6 text-7xl text-gold/12 font-serif leading-none select-none">&ldquo;</span>
            <div className="flex gap-1 mb-4">
              {[...Array(r.rating)].map((_,j) => (
                <FiStar key={j} size={14} fill="#C8A951" stroke="#C8A951"/>
              ))}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed italic mb-6">{r.text}</p>
            <div>
              <div className="font-bold text-[13.5px] text-black">— {r.name}</div>
              <div className="text-gray-400 text-xs mt-0.5">{r.city}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
