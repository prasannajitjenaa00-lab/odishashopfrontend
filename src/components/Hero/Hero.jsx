import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } }
const fadeRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 } } }

export default function Hero() {
  return (
    <section className="bg-[#111] min-h-[calc(100vh-106px)] grid grid-cols-1 lg:grid-cols-2 items-center gap-10 px-5 lg:px-[7%] py-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(200,169,81,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Content */}
      <motion.div variants={fadeLeft} initial="hidden" animate="visible" className="relative z-10 order-2 lg:order-1">
        <div className="flex items-center gap-2.5 text-gold text-xs font-bold tracking-[4px] uppercase mb-4">
          <span className="w-7 h-px bg-gold inline-block" />
          Direct from Odisha Farms
        </div>

        <h1 className="font-extrabold text-white leading-[1.08] mb-5 tracking-tight" style={{ fontSize: 'clamp(36px, 4.5vw, 62px)' }}>
          Pure &amp; Authentic<br />
          <span className="text-gold">Flavors of Odisha</span>
        </h1>

        <p className="text-white/60 text-sm leading-relaxed mb-10 max-w-md">
          Premium quality Gota Biri, Red Rice and more — sourced directly from local farmers, delivered to your home with love.
        </p>

        <div className="flex gap-4 flex-wrap">
          <Link to="/shop" className="btn-gold">Shop Now</Link>
          <Link to="/story" className="btn-outline-white">Explore More</Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 sm:gap-10 mt-12 pt-10 border-t border-white/10">
          {[['5000+', 'Happy Customers'], ['20+', 'Local Farmers'], ['100%', 'Natural Products']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-gold font-extrabold text-2xl leading-none">{num}</div>
              <div className="text-white/40 text-[10px] tracking-widest uppercase mt-1.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Video Section */}
      <motion.div variants={fadeRight} initial="hidden" animate="visible" className="relative z-10 flex justify-center items-center order-1 lg:order-2">
        <div className="relative w-full max-w-[520px]">
          <div className="absolute inset-[-20px] border border-gold/20 rounded-3xl animate-pulse pointer-events-none" />
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1200] via-[#2a1f00] to-[#0d0d0d] relative" style={{ aspectRatio: '4/3' }}>
            <video 
              className="w-full h-full object-cover drop-shadow-2xl"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              {/* Fallback if video doesn't load */}
              <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="bowlGrad" cx="50%" cy="70%" r="60%">
                    <stop offset="0%" stopColor="#8B6914"/>
                    <stop offset="60%" stopColor="#5A3E0A"/>
                    <stop offset="100%" stopColor="#2A1800"/>
                  </radialGradient>
                  <radialGradient id="innerGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#3a2a00"/>
                    <stop offset="100%" stopColor="#1a1200"/>
                  </radialGradient>
                </defs>
                <ellipse cx="200" cy="180" rx="150" ry="80" fill="rgba(200,169,81,0.06)"/>
                <ellipse cx="200" cy="235" rx="130" ry="18" fill="rgba(0,0,0,0.5)"/>
                <path d="M70 170 Q200 280 330 170 L310 155 Q200 260 90 155 Z" fill="url(#bowlGrad)"/>
                <ellipse cx="200" cy="155" rx="115" ry="20" fill="#7A5910"/>
                <ellipse cx="200" cy="152" rx="110" ry="17" fill="#9A7425"/>
                <ellipse cx="200" cy="150" rx="105" ry="15" fill="url(#innerGrad)"/>
                <g fill="#1a1a1a">
                  {[[165,148,-20],[185,143,10],[205,141,-5],[225,145,15],[243,150,-10],[155,155,5],[175,153,0],[198,151,-8],[218,154,12],[237,157,-3]].map(([cx,cy,r],i) => (
                    <ellipse key={i} cx={cx} cy={cy} rx="8" ry="6" transform={`rotate(${r},${cx},${cy})`}/>
                  ))}
                </g>
                <g fill="rgba(255,255,255,0.7)">
                  {[[165,146],[205,139],[243,148],[185,141],[225,143]].map(([cx,cy],i) => (
                    <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2"/>
                  ))}
                </g>
                <path d="M90 155 Q200 175 310 155" stroke="#C8A951" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <text x="200" y="210" textAnchor="middle" fontFamily="'Poppins',sans-serif" fontSize="11" fill="rgba(200,169,81,0.5)" letterSpacing="3">ODISHASHOP</text>
                <g fill="rgba(80,120,50,0.4)">
                  <ellipse cx="70" cy="145" rx="18" ry="8" transform="rotate(-30,70,145)"/>
                  <ellipse cx="330" cy="145" rx="18" ry="8" transform="rotate(30,330,145)"/>
                </g>
              </svg>
            </video>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
