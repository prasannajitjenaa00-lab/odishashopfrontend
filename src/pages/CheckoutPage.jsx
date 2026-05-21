import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiCreditCard, FiCheck, FiChevronRight } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../api/axios'
import AddressForm from '../components/AddressForm'

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

  const [savedAddresses, setSavedAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  const fetchSavedAddresses = async () => {
    try {
      const { data } = await api.get('/addresses')
      setSavedAddresses(data)
      const defaultAddr = data.find(a => a.isDefault) || data[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id)
      } else {
        setShowAddressForm(true) // Open new address form if no address exists
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err.message)
    } finally {
      setLoadingAddresses(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSavedAddresses()
    }
  }, [user])

  useEffect(() => {
    if (selectedAddressId && savedAddresses.length > 0) {
      const selected = savedAddresses.find(a => a._id === selectedAddressId)
      if (selected) {
        setAddress({
          name: selected.name,
          phone: selected.phone,
          line1: `${selected.address}, ${selected.locality}${selected.landmark ? `, Landmark: ${selected.landmark}` : ''}${selected.alternatePhone ? `, Alt Phone: ${selected.alternatePhone}` : ''}`,
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode
        })
        verifyPincodeAuto(selected.pincode)
      }
    }
  }, [selectedAddressId, savedAddresses])

  const verifyPincodeAuto = async (pin) => {
    setValidating(true)
    setPinStatus({ type: 'loading', message: 'Checking pincode...' })
    try {
      const { data } = await api.post('/check-pincode', { pincode: pin })
      if (data.success && data.deliveryAvailable) {
        setPinStatus({ type: 'success', message: data.message || `Delivery available in ${data.area || data.district}` })
      } else {
        setPinStatus({ type: 'error', message: data.message || 'Currently not delivering in this area' })
      }
    } catch (error) {
      setPinStatus({ type: 'error', message: error.response?.data?.message || 'Failed to verify pincode' })
    } finally {
      setValidating(false)
    }
  }

  const handleContinueToPayment = async () => {
    if (!selectedAddressId) {
      return toast.error('Please select or add a delivery address')
    }
    const selected = savedAddresses.find(a => a._id === selectedAddressId)
    if (!selected) {
      return toast.error('Selected address is invalid')
    }

    if (pinStatus.type === 'error') {
      return toast.error('Currently not delivering in this area')
    }
    
    if (pinStatus.type !== 'success') {
      setValidating(true)
      try {
        const { data } = await api.post('/check-pincode', { pincode: selected.pincode })
        if (data.success && data.deliveryAvailable) {
          setPinStatus({ type: 'success', message: data.message || `Delivery available in ${data.area || data.district}` })
          setStep(1)
        } else {
          setPinStatus({ type: 'error', message: data.message || 'Currently not delivering in this area' })
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <FiMapPin className="text-gold" size={20}/>
                    <h2 className="font-bold text-lg text-black">Delivery Address</h2>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                      className="btn-gold py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <AddressForm
                    initialAddress={editingAddress}
                    onSubmit={async (saved) => {
                      await fetchSavedAddresses()
                      setSelectedAddressId(saved._id)
                      setShowAddressForm(false)
                      setEditingAddress(null)
                    }}
                    onCancel={() => {
                      setShowAddressForm(false)
                      setEditingAddress(null)
                    }}
                  />
                ) : loadingAddresses ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
                    <span className="text-gray-400 text-xs font-semibold">Loading addresses...</span>
                  </div>
                ) : savedAddresses.length === 0 ? (
                  <div className="text-center py-16 bg-cream/15 border border-dashed border-black/10 rounded-3xl">
                    <FiMapPin className="text-gray-200 mx-auto mb-4" size={64}/>
                    <h3 className="text-lg font-bold text-black mb-2">No addresses saved yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Add shipping addresses to continue checking out.</p>
                    <button
                      onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                      className="btn-gold py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id
                        return (
                          <div 
                            key={addr._id} 
                            onClick={() => setSelectedAddressId(addr._id)}
                            className={`bg-white border-2 rounded-2xl p-5 relative transition-all duration-300 flex flex-col justify-between cursor-pointer select-none ${
                              isSelected 
                                ? 'border-gold bg-gold/2 shadow-md shadow-gold/5' 
                                : 'border-black/5 hover:border-gold/30 hover:shadow-sm'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-sm text-black flex items-center gap-1.5">
                                  {addr.name}
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    addr.addressType === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {addr.addressType === 'work' ? '💼 Work' : '🏡 Home'}
                                  </span>
                                </span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'border-gold bg-gold' : 'border-gray-300'
                                }`}>
                                  {isSelected && <FiCheck size={12} className="text-black font-bold"/>}
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                📱 {addr.phone} {addr.alternatePhone && <span className="text-gray-400 font-medium">| Alt: {addr.alternatePhone}</span>}
                              </p>

                              <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-0.5 text-left">
                                <p className="font-semibold text-black">{addr.address}</p>
                                <p>{addr.locality}</p>
                                {addr.landmark && <p className="text-gray-400 italic">Landmark: {addr.landmark}</p>}
                                <p className="font-semibold text-black/80">{addr.city}, {addr.state} - <span className="font-bold text-gold">{addr.pincode}</span></p>
                              </div>
                              
                              {isSelected && pinStatus.message && (
                                <div className={`pt-2 text-[10px] font-bold ${
                                  pinStatus.type === 'error' ? 'text-red-500' : pinStatus.type === 'success' ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {pinStatus.message}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/5 mt-4" onClick={e => e.stopPropagation()}>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                                  className="text-xs font-bold text-gray-500 hover:text-gold transition-colors py-1 px-2.5 rounded-lg border border-black/5 hover:border-gold/30 bg-white"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this address?')) {
                                      try {
                                        await api.delete(`/addresses/${addr._id}`);
                                        toast.success('Address deleted successfully!');
                                        await fetchSavedAddresses();
                                      } catch (err) {
                                        toast.error('Failed to delete address');
                                      }
                                    }
                                  }}
                                  className="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors py-1 px-2.5 rounded-lg border border-transparent hover:border-red-100 bg-white"
                                >
                                  Delete
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedAddressId(addr._id)
                                  // Wait for sync, or directly trigger advanced payment handler
                                  setTimeout(() => {
                                    handleContinueToPayment()
                                  }, 50)
                                }}
                                className="text-[10px] font-bold text-gold hover:text-white bg-gold/10 hover:bg-gold py-1.5 px-3 rounded-lg border border-gold/20 hover:border-transparent transition-all uppercase tracking-wider"
                              >
                                Deliver Here
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <button 
                      onClick={handleContinueToPayment} 
                      disabled={validating || pinStatus.type === 'error'} 
                      className="btn-gold mt-6 w-full py-3.5 rounded-xl disabled:opacity-60 font-bold uppercase tracking-wider text-xs"
                    >
                      {validating ? 'Checking Delivery...' : 'Continue to Payment'}
                    </button>
                  </div>
                )}
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
