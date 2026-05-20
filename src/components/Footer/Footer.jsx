import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { FiTruck, FiRefreshCw, FiLock, FiPhone } from 'react-icons/fi'

const trust = [
  { icon: <FiTruck size={26}/>, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: <FiRefreshCw size={26}/>, title: '7 Days Return', desc: 'Easy return policy' },
  { icon: <FiLock size={26}/>, title: 'Secure Payment', desc: '100% secure payments' },
  { icon: <FiPhone size={26}/>, title: 'Customer Support', desc: 'We are here to help' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111] border-t border-gold/20">
      {/* Trust */}
      <div className="bg-gold/8 border-b border-gold/12 px-5 lg:px-[7%] py-7 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {trust.map((t, i) => (
          <div key={i} className="flex items-center gap-3.5">
            <span className="text-gold">{t.icon}</span>
            <div>
              <strong className="text-white text-[13px] block font-bold">{t.title}</strong>
              <span className="text-white/40 text-[11.5px]">{t.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="px-5 lg:px-[7%] py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img src="/logo.png" alt="ODISHASHOP" className="w-8 h-8 object-contain rounded-full border border-gold/30 p-0.5 bg-white/5" />
            <div className="text-gold font-extrabold text-xl tracking-wider">ODISHASHOP</div>
          </div>
          <p className="text-white/45 text-xs leading-relaxed mb-6">Your one-stop shop for premium quality agricultural products from the heart of Odisha. Pure, natural and delivered with care.</p>
          <div className="flex gap-3">
            {[<FiFacebook/>, <FiInstagram/>, <FaWhatsapp/>].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-gold/30 rounded-xl flex items-center justify-center text-white/50 hover:border-gold hover:text-gold hover:bg-gold/8 transition-all duration-300">
                {Icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h5 className="text-white text-xs font-bold tracking-[1.5px] uppercase mb-5 pb-3 border-b border-gold/20">Quick Links</h5>
          <ul className="flex flex-col gap-2.5">
            {[['Home','/'],['Shop','/shop'],['Our Story','/story'],['Blog','/blog'],['Contact Us','/contact']].map(([l,to]) => (
              <li key={l}><Link to={to} className="text-white/45 text-[13px] hover:text-gold transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h5 className="text-white text-xs font-bold tracking-[1.5px] uppercase mb-5 pb-3 border-b border-gold/20">Customer Care</h5>
          <ul className="flex flex-col gap-2.5">
            {[['Shipping Policy','/shipping'],['Return & Refund','/refund'],['Terms & Conditions','/terms'],['Privacy Policy','/privacy'],['FAQ','/faq']].map(([l,to]) => (
              <li key={l}><Link to={to} className="text-white/45 text-[13px] hover:text-gold transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-white text-xs font-bold tracking-[1.5px] uppercase mb-5 pb-3 border-b border-gold/20">Contact Us</h5>
          <div className="flex flex-col gap-3.5">
            {[['📍','Jaipur, Odisha, India'],['📞','+91 1234567890'],['✉️','support@odisha.shop'],['🕐','Mon - Sat: 9AM – 7PM']].map(([icon,val],i) => (
              <div key={i} className="flex items-start gap-2.5 text-white/45 text-xs leading-relaxed">
                <span>{icon}</span><span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/7 px-5 lg:px-[7%] py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-white/30 text-xs">© 2026 OdishaShop | All Rights Reserved</div>
        <div className="flex flex-wrap justify-center gap-5">
          {['Privacy Policy','Terms of Service','Shipping Policy','Refund Policy'].map(l => (
            <Link key={l} to="#" className="text-white/30 text-xs hover:text-gold transition-colors">{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
