import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiPackage, FiDollarSign, FiUsers } from 'react-icons/fi'

const cards = [
  { icon: <FiShield size={24}/>, title: 'Local & Sustainable', desc: 'Supporting local farmers and sustainable farming practices across Odisha.' },
  { icon: <FiPackage size={24}/>, title: 'Hygienically Packed', desc: 'Cleaned, sorted and packed with care to maintain freshness and purity.' },
  { icon: <FiDollarSign size={24}/>, title: 'No Middlemen', desc: 'Better quality at honest prices. Direct from farmer to your doorstep.' },
  { icon: <FiUsers size={24}/>, title: 'Trusted by Thousands', desc: 'Loved by customers across India who value authentic Odia products.' },
]

export default function WhyUs() {
  const ref = useRef(null)
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
  }, [])

  return (
    <section className="bg-[#111] px-5 lg:px-[7%] py-20 md:py-24 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-center" id="why-us" ref={ref}>
      {/* Left */}
      <div className="reveal">
        <div className="flex items-center gap-2.5 text-gold text-xs font-bold tracking-[4px] uppercase mb-4">
          <span className="w-6 h-px bg-gold inline-block"/>
          Why Choose Us?
        </div>
        <h2 className="font-extrabold text-white leading-tight mb-5" style={{ fontSize: 'clamp(28px,3vw,42px)', letterSpacing:'-0.3px' }}>
          From Our Land to <span className="text-gold">Your Home</span>
        </h2>
        <p className="text-white/55 text-sm leading-[1.9] mb-9">
          We bring you the finest agricultural products from Odisha with a promise of purity, quality and trust. Every grain is handpicked and hygienically packed for your family.
        </p>
        <Link to="/story" className="btn-gold">Know Our Story</Link>
      </div>

      {/* Right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="reveal border border-gold/25 rounded-2xl p-6 transition-all duration-300 hover:border-gold hover:bg-gold/[0.04] hover:-translate-y-1 cursor-default" style={{ transitionDelay: `${i * 0.1}s` }}>
            <span className="text-gold block mb-3">{c.icon}</span>
            <h4 className="text-white text-sm font-bold mb-2">{c.title}</h4>
            <p className="text-white/45 text-xs leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
