import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiClock, FiInstagram, FiFacebook, FiYoutube, FiChevronDown } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CONTACT_INFO = [
  { icon: <FiPhone size={24} className="text-gold" />, title: 'Phone Number', detail: '+91 98765 43210', subtitle: 'Support Mon-Sat', link: 'tel:+919876543210' },
  { icon: <FiMail size={24} className="text-gold" />, title: 'Email Address', detail: 'support@odishashop.in', subtitle: 'Response within 24h', link: 'mailto:support@odishashop.in' },
  { icon: <FiMapPin size={24} className="text-gold" />, title: 'Business Address', detail: 'Bhubaneswar, Odisha, India', subtitle: 'Ancient Spice Hub' },
  { icon: <FiClock size={24} className="text-gold" />, title: 'Working Hours', detail: '9 AM - 7 PM', subtitle: 'Standard IST Zone' }
]

const FAQS = [
  { q: 'How long does delivery take?', a: 'Standard deliveries to major Indian metros typically take 3 to 5 business days. Remote locations and villages can take up to 7 days. We package all authentic food items in secure air-tight containers to retain maximum freshness during transit.' },
  { q: 'Are products organic?', a: 'Yes! Most of our items (like Gota Biri, Red Rice, unpolished organic pulses, and natural village honey) are sourced directly from certified pesticide-free organic farms in rural Odisha, upholding traditional ecological cultivation techniques.' },
  { q: 'Do you deliver across India?', a: 'Absolutely! We deliver to over 19,000 pincodes across all states and Union Territories in India. Free shipping is automatically applied at checkout for all orders valued above ₹499.' },
  { q: 'How can I track my order?', a: 'Once your order is processed and packed, you will receive an SMS and email notification containing the courier partner details (e.g. Delhivery, BlueDart) and your unique tracking ID. You can easily trace its journey directly in your Account dashboard or on our tracking portal.' }
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validations
    if (!form.name || !form.email || !form.phone || !form.subject || !form.message) {
      return toast.error('Please complete all form fields')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      return toast.error('Please supply a valid email address')
    }

    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      return toast.error('Please enter a valid 10-digit phone number')
    }

    setSubmitting(true)
    const toastId = toast.loading('Sending your message to OdishaShop...')

    try {
      await api.post('/contact', form)
      toast.success('Thank you! Your message has been sent successfully.', { id: toastId, style: { background: '#111', color: '#fff', border: '1px solid #C8A951' } })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit message. Please try again.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-cream min-h-screen pb-24 text-left">
      <title>Contact Us — Get in Touch | OdishaShop Support</title>

      {/* ── 1. CONTACT HERO SECTION ── */}
      <div className="bg-[#111] py-16 md:py-24 text-center px-5 border-b border-gold/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,81,0.08)_0,transparent_60%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-gold font-bold text-xs uppercase tracking-[0.25em] block mb-3">OdishaShop Care</span>
          <h1 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-wide uppercase">
            Get In Touch With OdishaShop
          </h1>
          <p className="text-white/60 text-sm md:text-base mt-4 max-w-xl mx-auto font-medium leading-relaxed">
            We are here to help you with authentic Odisha food products and customer support. Contact us for bulk orders, parcel inquiries, or product specifications.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-[7%] pt-16">
        
        {/* ── 2. CONTACT INFORMATION CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {CONTACT_INFO.map((info, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-black/5 flex items-start gap-4 hover:shadow-xl hover:border-gold/30 transition-all duration-300 transform hover:-translate-y-1 w-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-cream border border-gold/25 flex items-center justify-center shrink-0 shadow-sm">
                {info.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider mb-1">{info.title}</h4>
                {info.link ? (
                  <a href={info.link} className="font-black text-black text-sm mb-0.5 hover:text-gold transition-colors block break-all">
                    {info.detail}
                  </a>
                ) : (
                  <p className="font-black text-black text-sm mb-0.5 break-words">{info.detail}</p>
                )}
                <span className="text-[10px] font-semibold text-gray-400 block">{info.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 3. CONTACT FORM & SOCIALS SEGMENT ── */}
        <div className="max-w-2xl mx-auto mb-20 space-y-8">
          
          {/* Contact Input Form */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-black/5 shadow-sm">
            <h2 className="text-black font-black text-2xl uppercase tracking-wide mb-2">Send Us A Message</h2>
            <div className="section-divider bg-gold h-0.5 w-12 mb-6" />
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-8">
              Fill out the secure form below. We read and respond to every message within one business day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. Priyabrata Mohanty" 
                    value={form.name} 
                    onChange={handleInputChange}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors font-medium bg-cream/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    placeholder="e.g. client@email.com" 
                    value={form.email} 
                    onChange={handleInputChange}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors font-medium bg-cream/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="e.g. +91 99999 88888" 
                    value={form.phone} 
                    onChange={handleInputChange}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors font-medium bg-cream/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Subject *</label>
                  <input 
                    type="text" 
                    name="subject" 
                    required 
                    placeholder="e.g. Bulk Rice Inquiry" 
                    value={form.subject} 
                    onChange={handleInputChange}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors font-medium bg-cream/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Your Message *</label>
                <textarea 
                  name="message" 
                  required 
                  rows={5} 
                  placeholder="Write your details, bulk requirements, or support inquiry here..." 
                  value={form.message} 
                  onChange={handleInputChange}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors font-medium bg-cream/30 resize-none mb-2"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full btn-gold py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs shadow-md shadow-gold/15 hover:shadow-xl transition-all"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black" />
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* ── 5. SOCIAL MEDIA LINKS ── */}
          <div className="bg-[#111] rounded-[2rem] p-6 border border-gold/10 text-center shadow-lg">
            <h3 className="text-gold font-extrabold text-sm uppercase tracking-widest mb-4">Join Our Communities</h3>
            <div className="flex justify-center items-center gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-full bg-white/5 border border-gold/30 hover:border-gold text-gold hover:text-white hover:bg-gold flex items-center justify-center transition-all duration-300"
                title="Instagram"
              >
                <FiInstagram size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-full bg-white/5 border border-gold/30 hover:border-gold text-gold hover:text-white hover:bg-gold flex items-center justify-center transition-all duration-300"
                title="Facebook"
              >
                <FiFacebook size={18} />
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-full bg-white/5 border border-gold/30 hover:border-gold text-gold hover:text-white hover:bg-gold flex items-center justify-center transition-all duration-300"
                title="WhatsApp Connect"
              >
                <FaWhatsapp size={18} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-full bg-white/5 border border-gold/30 hover:border-gold text-gold hover:text-white hover:bg-gold flex items-center justify-center transition-all duration-300"
                title="YouTube"
              >
                <FiYoutube size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* ── 6. FAQ SECTION (ACCORDION) ── */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="text-center mb-10">
            <span className="text-gold font-bold text-xs uppercase tracking-[0.2em] block mb-2">Help Desk</span>
            <h2 className="text-black font-black text-3xl uppercase tracking-wide">Frequently Asked Questions</h2>
            <div className="section-divider bg-gold h-0.5 w-12 mx-auto mt-3 mb-6" />
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-cream/20 transition-colors"
                >
                  <span className="font-extrabold text-black text-sm md:text-base">{faq.q}</span>
                  <FiChevronDown 
                    size={20} 
                    className={`text-gold transition-transform duration-300 ${openFaq === idx ? 'transform rotate-180' : ''}`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-black/5"
                    >
                      <div className="px-6 py-5 text-gray-500 text-sm leading-relaxed bg-cream/10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  )
}
