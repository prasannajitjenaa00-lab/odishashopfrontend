import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiCreditCard, FiCheck, FiChevronRight } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../api/axios'

const STEPS = ['Address', 'Payment', 'Confirm']

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', city: '', state: 'Odisha', pincode: '' })
  const [payMethod, setPayMethod] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [validating, setValidating] = useState(false)
  const [pinStatus, setPinStatus] = useState({ type: '', message: '' })
  const [currentOrderId, setCurrentOrderId] = useState(null)

  useEffect(() => {
    if (address.pincode && /^\d{6}$/.test(address.pincode)) {
      verifyPincodeAuto(address.pincode)
    }
  }, [address.pincode])

  const verifyPincodeAuto = async (pin) => {
    setValidating(true)
    setPinStatus({ type: 'loading', message: 'Checking pincode...' })
    try {
      const { data } = await api.post('/check-pincode', { pincode: pin })
      if (data.success && data.deliveryAvailable) {
        setPinStatus({ type: 'success', message: data.message || `Delivery available in ${data.area || data.district}` })
        setAddress(prev => ({ ...prev, city: data.district, state: data.state }))
      } else {
        setPinStatus({ type: 'error', message: data.message || 'Currently not delivering in this area' })
        if (data.district) setAddress(prev => ({ ...prev, city: data.district, state: data.state || 'Odisha' }))
      }
    } catch (error) {
      setPinStatus({ type: 'error', message: error.response?.data?.message || 'Failed to verify pincode' })
    } finally {
      setValidating(false)
    }
  }

  const handleContinueToPayment = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      return toast.error('Please fill all address fields')
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      return toast.error('Please enter a valid 6-digit pincode')
    }
    if (pinStatus.type === 'error') {
      return toast.error('Please provide a valid pincode in the delivery area')
    }
    
    if (pinStatus.type !== 'success') {
      setValidating(true)
      try {
        const { data } = await api.post('/check-pincode', { pincode: address.pincode })
        if (data.success && data.deliveryAvailable) {
          setPinStatus({ type: 'success', message: data.message || `Delivery available in ${data.area || data.district}` })
          setStep(1)
        } else {
          setPinStatus({ type: 'error', message: data.message || 'Currently not delivering in this area' })
          if (data.district) setAddress(prev => ({ ...prev, city: data.district, state: data.state || 'Odisha' }))
          return toast.error(data.message || 'Currently not delivering in this area')
        }
      } catch (error) {
        return toast.error(error.response?.data?.message || 'Failed to verify pincode')
      } finally {
        setValidating(false)
      }
    } else {
      setStep(1)
    }
  }

  const shipping = cartTotal >= 499 ? 0 : 49
  const total = cartTotal + shipping

  // Load Razorpay script
  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  const handlePlaceOrder = async () => {
    if (!user) {
      return toast.error('Please login to place an order')
    }

    setPlacing(true)
    try {
      // Create order
      const { data } = await api.post('/orders', {
        items: cartItems,
        shippingAddress: address,
        paymentMethod: payMethod,
      })

      if (payMethod === 'razorpay') {
        if (!window.Razorpay) {
          toast.error('Razorpay SDK is still loading. Please wait a moment and try again.')
          setPlacing(false)
          return
        }
        setCurrentOrderId(data.order._id)
        
        const options = {
          key: data.key,
          amount: data.order.totalPrice * 100, // paise
          currency: 'INR',
          name: 'ODISHASHOP',
          description: `Order #${data.order._id}`,
          image: '/logo.png',
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              // Verify payment
              const { data: verifyData } = await api.post(`/orders/${data.order._id}/verify-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              
              clearCart()
              toast.success('Payment successful! 🎉', {
                style: { background: '#111', color: '#fff', border: '1px solid #C8A951' },
                duration: 4000
              })
              navigate('/order-success')
            } catch (error) {
              toast.error(error.response?.data?.message || 'Payment verification failed')
            }
          },
          prefill: {
            name: address.name,
            email: user?.email,
            contact: address.phone,
          },
          theme: {
            color: '#C8A951'
          },
          modal: {
            ondismiss: () => {
              setPlacing(false)
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          toast.error('Payment failed. Please try again.')
          console.error('Payment failed:', response)
        })
        rzp.open()
      } else {
        // COD - immediate success
        clearCart()
        toast.success('Order placed successfully! 🎉', {
          style: { background: '#111', color: '#fff', border: '1px solid #C8A951' },
          duration: 4000
        })
        navigate('/order-success')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
      console.error('Order error:', error)
    } finally {
      setPlacing(false)
    }
  }

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <div>
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add products before checking out</p>
        <Link to="/shop" className="btn-gold">Shop Now</Link>
      </div>
    </div>
  )

  return (
    <div className="bg-cream min-h-screen py-10 px-5 lg:px-[7%]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/shop" className="text-gold text-sm flex items-center gap-1 mb-3 hover:underline">← Continue Shopping</Link>
          <h1 className="font-extrabold text-2xl text-black">Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === step ? 'bg-gold text-black' : i < step ? 'bg-gold/20 text-gold' : 'bg-white text-gray-400'}`}>
                {i < step ? <FiCheck size={14}/> : <span>{i+1}</span>}
                {s}
              </div>
              {i < STEPS.length - 1 && <FiChevronRight className="text-gray-300 mx-1" size={16}/>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Panel */}
          <div>
            {/* Step 0: Address */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                  <FiMapPin className="text-gold" size={20}/>
                  <h2 className="font-bold text-lg">Delivery Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['name','Full Name','text','col-span-1'],
                    ['phone','Phone Number','tel','col-span-1'],
                    ['line1','Street Address, Area','text','sm:col-span-2'],
                    ['city','City','text','col-span-1'],
                    ['pincode','Pincode','text','col-span-1'],
                  ].map(([key, label, type, cls]) => (
                    <div key={key} className={cls}>
                      <label className="text-xs font-medium text-gray-500 block mb-1.5">{label}</label>
                      <input type={type} value={address[key]} onChange={e => {
                        const value = key === 'pincode' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value
                        setAddress(a => ({...a, [key]: key === 'pincode' ? value.trim() : value}))
                        if (key === 'pincode') setPinStatus({ type: '', message: '' })
                      }}
                        placeholder={label}
                        inputMode={key === 'pincode' ? 'numeric' : undefined}
                        maxLength={key === 'pincode' ? 6 : undefined}
                        autoComplete={key === 'pincode' ? 'postal-code' : undefined}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                          key === 'city' && pinStatus.type === 'error' ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-black/10 focus:border-gold'
                        }`}/>
                      {key === 'pincode' && pinStatus.message && (
                        <div className={`mt-1.5 text-xs font-semibold ${pinStatus.type === 'error' ? 'text-red-500' : pinStatus.type === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                          {pinStatus.message}
                        </div>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">State</label>
                    <select value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))}
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors bg-white">
                      {['Odisha','Andhra Pradesh','Karnataka','Maharashtra','Delhi','Tamil Nadu','West Bengal'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleContinueToPayment} disabled={validating} className="btn-gold mt-6 w-full py-3.5 rounded-xl disabled:opacity-60">
                  {validating ? 'Checking Delivery...' : 'Continue to Payment'}
                </button>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                  <FiCreditCard className="text-gold" size={20}/>
                  <h2 className="font-bold text-lg">Payment Method</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'razorpay', label: 'Pay Online', desc: 'Credit/Debit Card, UPI, Net Banking', icon: '💳' },
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  ].map(opt => (
                    <label key={opt.id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${payMethod === opt.id ? 'border-gold bg-gold/5' : 'border-black/8 hover:border-gold/40'}`}>
                      <input type="radio" name="pay" value={opt.id} checked={payMethod === opt.id} onChange={() => setPayMethod(opt.id)} className="hidden"/>
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-black">{opt.label}</div>
                        <div className="text-xs text-gray-400">{opt.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === opt.id ? 'border-gold bg-gold' : 'border-gray-300'}`}>
                        {payMethod === opt.id && <div className="w-2 h-2 rounded-full bg-black"/>}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="flex-1 border border-black/10 rounded-xl py-3.5 text-sm font-semibold text-gray-600 hover:border-gold hover:text-gold transition-all">
                    Back
                  </button>
                  <button onClick={() => setStep(2)} className="flex-1 btn-gold py-3.5 rounded-xl">
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="font-bold text-lg mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center py-3 border-b border-black/5">
                      <div>
                        <p className="text-sm font-semibold text-black">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.weight} × {item.qty}</p>
                      </div>
                      <span className="font-bold text-sm">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-cream rounded-2xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{cartTotal}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className={shipping === 0 ? 'text-green-500 font-semibold' : 'font-semibold'}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-black/8 pt-2 mt-1"><span>Total</span><span className="text-gold">₹{total}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-black/10 rounded-xl py-3.5 text-sm font-semibold text-gray-600 hover:border-gold hover:text-gold transition-all">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing}
                    className="flex-1 btn-gold py-3.5 rounded-xl disabled:opacity-60">
                    {placing ? 'Placing Order...' : `Place Order — ₹${total}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-base mb-4 pb-3 border-b border-black/6">Your Items ({cartItems.length})</h3>
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate">{item.shortName || item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold ml-2">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black/6 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{cartTotal}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-500">FREE</span> : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-extrabold text-base text-black pt-1 border-t border-black/6"><span>Total</span><span className="text-gold">₹{total}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
