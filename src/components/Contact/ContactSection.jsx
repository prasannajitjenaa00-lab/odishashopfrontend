import { Link } from 'react-router-dom'

export default function ContactSection() {
  return (
    <section className="bg-[#111] px-5 lg:px-[7%] py-16 md:py-20 border-t border-gold/15 text-center relative overflow-hidden">
      {/* Premium glowing background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,81,0.06)_0,transparent_60%)] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <span className="text-gold font-bold text-xs uppercase tracking-[0.25em] block mb-3">Customer Assistance</span>
        
        <h2 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-wide uppercase mb-4">
          Need Help? Contact OdishaShop
        </h2>
        
        <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed mb-8">
          Whether you have queries regarding delivery times, bulk procurement, recipe recommendations, or agricultural partnerships, our friendly team is eager to assist you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/contact" 
            className="w-full sm:w-auto btn-gold px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md shadow-gold/20 transition-all hover:scale-103"
          >
            Contact Us
          </Link>
          <a 
            href="tel:+919876543210" 
            className="w-full sm:w-auto border border-white/20 hover:border-gold/50 text-white hover:text-gold px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
          >
            Call +91 98765 43210
          </a>
        </div>
      </div>
    </section>
  )
}
