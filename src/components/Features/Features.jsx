import { FiShield, FiUsers, FiCheckCircle, FiTruck } from 'react-icons/fi'
import { useEffect, useRef } from 'react'

const features = [
  { icon: <FiShield size={20}/>, title: '100% Pure & Natural', desc: 'No chemicals, no preservatives' },
  { icon: <FiUsers size={20}/>, title: 'Sourced from Farmers', desc: 'Directly from Odisha farms' },
  { icon: <FiCheckCircle size={20}/>, title: 'Premium Quality', desc: 'Carefully cleaned & packed' },
  { icon: <FiTruck size={20}/>, title: 'Fast & Safe Delivery', desc: 'Across Odisha & India' },
]

export default function Features() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    if (!els) return
    const timeouts = []
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => e.target.classList.add('visible'), i * 100)
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
    <div ref={ref} className="bg-[#111] border-t border-gold/15 px-5 lg:px-[7%] py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f, i) => (
        <div key={i} className="reveal flex items-start gap-3.5 p-5 border border-gold/12 rounded-2xl transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 cursor-default">
          <div className="w-11 h-11 min-w-[44px] bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center text-gold">
            {f.icon}
          </div>
          <div>
            <h4 className="text-white text-[13.5px] font-semibold mb-1">{f.title}</h4>
            <p className="text-white/45 text-xs leading-relaxed">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
