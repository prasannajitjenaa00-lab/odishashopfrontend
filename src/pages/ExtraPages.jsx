import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiPackage } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/Products/ProductCard'
import { PRODUCTS } from '../api/data'
import { useAuth } from '../context/AuthContext'
import { FiHeart, FiUser, FiShoppingBag, FiSettings, FiLogOut, FiClock, FiMapPin, FiCalendar, FiCreditCard, FiChevronDown, FiChevronUp, FiTruck, FiFileText } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import AddressForm from '../components/AddressForm'
import { downloadInvoice } from '../utils/labelGenerator'

// ─── Order Success ──────────────────────────────────────────────────────────
export function OrderSuccessPage() {
  const orderId = `ORD${Date.now().toString().slice(-6)}`
  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center px-5 py-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center mx-auto mb-7">
          <FiCheckCircle className="text-gold" size={44}/>
        </div>
        <h1 className="text-white font-extrabold text-3xl mb-3">Order Placed! 🎉</h1>
        <p className="text-white/55 text-sm mb-2">Thank you for shopping with OdishaShop</p>
        <p className="text-gold text-xs font-bold tracking-widest mb-8">Order ID: #{orderId}</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
          {[
            ['Estimated Delivery', '3–5 business days'],
            ['Tracking', 'SMS & Email notification'],
            ['Support', 'support@odisha.shop'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-white/40">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link to="/" className="flex-1 btn-outline-white text-center py-3 rounded-xl">Back to Home</Link>
          <Link to="/shop" className="flex-1 btn-gold text-center py-3 rounded-xl">Shop More</Link>
        </div>
      </motion.div>
    </div>
  )
}

// ─── 404 Page ────────────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-gold font-extrabold text-[120px] leading-none mb-4 opacity-20">404</div>
        <h1 className="text-3xl font-extrabold text-black mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-gold">Go Back Home</Link>
      </motion.div>
    </div>
  )
}

// ─── Wishlist Page ────────────────────────────────────────────────────────────
export function WishlistPage() {
  const { wishlist } = useCart()
  return (
    <div className="bg-cream min-h-screen px-5 lg:px-[7%] py-12">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="text-gold" size={24}/>
        <h1 className="font-extrabold text-2xl text-black">My Wishlist</h1>
        <span className="bg-gold text-black text-xs font-bold px-2.5 py-0.5 rounded-full">{wishlist.length}</span>
      </div>
      {wishlist.length === 0 ? (
        <div className="text-center py-24">
          <FiHeart className="text-gray-200 mx-auto mb-4" size={64}/>
          <h3 className="text-lg font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">Save items you love for later</p>
          <Link to="/shop" className="btn-gold">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(p => <ProductCard key={p._id} product={p}/>)}
        </div>
      )}
    </div>
  )
}

const getClientStatusBadge = (status) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-700 border border-green-200'
    case 'Shipped': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    case 'Out for Delivery': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'Packed': return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'Confirmed': return 'bg-purple-100 text-purple-700 border border-purple-200'
    case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200'
    default: return 'bg-gray-100 text-gray-600 border border-gray-200'
  }
}

// ─── Account Page ─────────────────────────────────────────────────────────────
export function AccountPage() {
  const { user, logout, updateUser } = useAuth()
  const { wishlist } = useCart()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')
  
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      setEditName(user.name)
    }
  }, [user])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my')
        setOrders(data)
      } catch (err) {
        console.error('Failed to load user orders:', err.message)
      } finally {
        setLoadingOrders(false)
      }
    }

    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/addresses')
        setAddresses(data)
      } catch (err) {
        console.error('Failed to load user addresses:', err.message)
      } finally {
        setLoadingAddresses(false)
      }
    }

    if (user) {
      fetchOrders()
      fetchAddresses()
    }
  }, [user])

  const handleInvoiceDownload = async (order) => {
    const toastId = toast.loading('Generating tax invoice PDF...')
    try {
      await downloadInvoice(order)
      toast.success('Invoice downloaded successfully!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to download invoice. Please try again.', { id: toastId })
    }
  }

  if (!user) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
      <div>
        <FiUser className="text-gray-300 mx-auto mb-4" size={56}/>
        <h2 className="text-xl font-bold mb-2">Please login to continue</h2>
        <Link to="/login" className="btn-gold mt-4 inline-block">Login / Register</Link>
      </div>
    </div>
  )

  return (
    <div className="bg-cream min-h-screen px-5 lg:px-[7%] py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
            <FiUser className="text-gold" size={28}/>
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-2xl text-black">{user.name}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            [FiShoppingBag, 'My Orders', `${orders.length} orders`, 'orders'],
            [FiMapPin, 'My Addresses', `${addresses.length} addresses`, 'addresses'],
            [FiHeart, 'Wishlist', `${wishlist.length} saved items`, 'wishlist'],
            [FiSettings, 'Settings', 'Manage profile', 'settings'],
          ].map(([Icon, title, sub, tabKey], i) => (
            <div key={i} onClick={() => {
              if (tabKey === 'wishlist') {
                // Redirect directly to the dedicated Wishlist page
                window.location.href = '/wishlist'
              } else {
                setActiveTab(tabKey)
                setShowAddressForm(false)
                setEditingAddress(null)
              }
            }}
              className={`bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 cursor-pointer border transition-colors ${
                activeTab === tabKey ? 'border-gold bg-gold/5' : 'border-transparent hover:border-gold/50'
              }`}>
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Icon className="text-gold" size={18}/>
              </div>
              <div className="text-left min-w-0">
                <p className="font-semibold text-sm text-black truncate">{title}</p>
                <p className="text-xs text-gray-400 truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Section Contents */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm mb-8">
          {activeTab === 'orders' && (
            <div>
              <h2 className="font-extrabold text-xl text-black mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-gold"/> Order History
              </h2>

              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
                  <span className="text-gray-400 text-xs font-semibold">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <FiShoppingBag className="text-gray-200 mx-auto mb-4" size={64}/>
                  <h3 className="text-lg font-bold text-black mb-2">No orders placed yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Explore our premium quality organic products.</p>
                  <Link to="/shop" className="btn-gold inline-block py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const isExpanded = expandedOrder === order._id
                    return (
                      <div key={order._id} className="border border-black/5 rounded-2xl overflow-hidden hover:border-gold/30 transition-colors bg-cream/20">
                        {/* Summary Header */}
                        <div onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-white">
                          
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-extrabold text-sm text-black">#{order._id.slice(-6).toUpperCase()}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${getClientStatusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                              <FiCalendar size={12}/> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                            <div className="text-left md:text-right space-y-0.5">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Amount</p>
                              <p className="font-extrabold text-base text-gold">₹{order.totalPrice}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-gold text-xs font-bold hidden sm:inline-block">
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </span>
                              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                                {isExpanded ? <FiChevronUp size={16}/> : <FiChevronDown size={16}/>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details Drawer */}
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-black/5 p-5 space-y-5 bg-[#fafafa]">
                            {/* Products Grid */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest text-left">Items Ordered</h4>
                              <div className="bg-white border border-black/5 rounded-xl p-4 space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-black/4 last:border-b-0 last:pb-0">
                                    <div className="text-left">
                                      <p className="font-bold text-black">{item.name}</p>
                                      <p className="text-gray-400 text-[10px]">{item.weight || '1kg'} · Qty: {item.qty}</p>
                                    </div>
                                    <span className="font-extrabold text-black">₹{item.price * item.qty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Info Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Shipping Address */}
                              <div className="space-y-2 text-left">
                                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiMapPin className="text-gold"/> Delivery Address</h4>
                                <div className="bg-white border border-black/5 rounded-xl p-4 leading-relaxed text-gray-600">
                                  <p className="font-bold text-black">{order.shippingAddress?.name}</p>
                                  <p>{order.shippingAddress?.phone}</p>
                                  <p>{order.shippingAddress?.line1}</p>
                                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                                </div>
                              </div>

                              {/* Payment & Courier Info */}
                              <div className="space-y-2 text-left">
                                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><FiCreditCard className="text-gold"/> Payment &amp; Courier Details</h4>
                                <div className="bg-white border border-black/5 rounded-xl p-4 space-y-2 text-gray-600">
                                  <p>
                                    <strong className="text-black font-semibold">Payment Status: </strong>
                                    <span className={`font-bold ml-1 ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                                      {order.isPaid ? 'PAID' : 'PENDING COD'}
                                    </span>
                                  </p>
                                  <p>
                                    <strong className="text-black font-semibold">Payment Method: </strong>
                                    <span className="uppercase">{order.paymentMethod === 'razorpay' ? 'Razorpay Gateway' : 'Cash On Delivery'}</span>
                                  </p>
                                  {order.courierName && (
                                    <div className="pt-2 border-t border-black/5 mt-2 space-y-1 text-[11px]">
                                      <p className="flex items-center gap-1"><FiTruck className="text-gold"/> <strong className="text-black font-semibold">Courier:</strong> {order.courierName}</p>
                                      <p><strong className="text-black font-semibold">Tracking ID:</strong> <span className="font-mono text-gold bg-gold/5 px-1.5 py-0.5 rounded">{order.trackingId}</span></p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {order.status === 'Delivered' && (
                              <div className="flex justify-end pt-3 mt-1">
                                <button
                                  onClick={() => handleInvoiceDownload(order)}
                                  className="btn-gold py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-gold/10 hover:shadow-lg transition-all"
                                >
                                  <FiFileText size={14} /> Download Invoice
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-extrabold text-xl text-black flex items-center gap-2">
                  <FiMapPin className="text-gold"/> Saved Addresses
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                    className="btn-gold py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <AddressForm
                  initialAddress={editingAddress}
                  onSubmit={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                    const f = async () => {
                      try {
                        const { data } = await api.get('/addresses');
                        setAddresses(data);
                      } catch (err) {
                        console.error(err);
                      }
                    };
                    f();
                  }}
                  onCancel={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                />
              ) : loadingAddresses ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
                  <span className="text-gray-400 text-xs font-semibold">Loading addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16 bg-cream/10 border border-dashed border-black/10 rounded-3xl">
                  <FiMapPin className="text-gray-200 mx-auto mb-4" size={64}/>
                  <h3 className="text-lg font-bold text-black mb-2">No addresses saved yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Add shipping addresses for a faster checkout experience.</p>
                  <button
                    onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                    className="btn-gold py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id} 
                      className={`bg-white border rounded-2xl p-5 relative transition-all duration-300 flex flex-col justify-between ${
                        addr.isDefault ? 'border-gold shadow-md shadow-gold/5 bg-gold/2' : 'border-black/5 hover:border-gold/30 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Row: Name and badge */}
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
                          {addr.isDefault && (
                            <span className="bg-gold/20 text-gold text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-gold/30">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Phone Number */}
                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          📱 {addr.phone} {addr.alternatePhone && <span className="text-gray-400 font-medium">| Alt: {addr.alternatePhone}</span>}
                        </p>

                        {/* Full Address details */}
                        <div className="text-xs text-gray-600 leading-relaxed pt-1 space-y-0.5 text-left">
                          <p className="font-semibold text-black">{addr.address}</p>
                          <p>{addr.locality}</p>
                          {addr.landmark && <p className="text-gray-400 italic">Landmark: {addr.landmark}</p>}
                          <p className="font-semibold text-black/80">{addr.city}, {addr.state} - <span className="font-bold text-gold">{addr.pincode}</span></p>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/5 mt-4">
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
                                  const { data } = await api.get('/addresses');
                                  setAddresses(data);
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

                        {!addr.isDefault && (
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/addresses/${addr._id}/default`);
                                toast.success('Default address updated!');
                                const { data } = await api.get('/addresses');
                                setAddresses(data);
                              } catch (err) {
                                toast.error('Failed to set default address');
                              }
                            }}
                            className="text-[10px] font-bold text-gold hover:text-white bg-gold/10 hover:bg-gold py-1.5 px-3 rounded-lg border border-gold/20 hover:border-transparent transition-all uppercase tracking-wider"
                          >
                            Deliver Here
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-left">
              <h2 className="font-extrabold text-xl text-black mb-6 flex items-center gap-2">
                <FiSettings className="text-gold"/> Profile &amp; Settings
              </h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 flex justify-between items-center">
                    Full Name
                    {!isEditingName && (
                      <button onClick={() => setIsEditingName(true)} className="text-gold hover:underline text-[10px] uppercase tracking-wider">
                        Edit
                      </button>
                    )}
                  </label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 border border-black/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium"
                      />
                      <button 
                        disabled={savingProfile}
                        onClick={async () => {
                          if (!editName.trim()) return toast.error('Name cannot be empty')
                          setSavingProfile(true)
                          const res = await updateUser({ name: editName.trim() })
                          if (res.success) {
                            toast.success('Profile updated successfully')
                            setIsEditingName(false)
                          } else {
                            toast.error(res.message)
                          }
                          setSavingProfile(false)
                        }}
                        className="bg-gold text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-60 hover:bg-yellow-600 transition-colors"
                      >
                        {savingProfile ? '...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingName(false)
                          setEditName(user.name)
                        }}
                        className="border border-black/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black hover:border-black/30 transition-colors bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="bg-cream/40 border border-black/5 rounded-xl px-4 py-3 text-sm text-black font-semibold">{user.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Email Address</label>
                  <p className="bg-cream/40 border border-black/5 rounded-xl px-4 py-3 text-sm text-gray-400">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Account Role</label>
                  <p className="bg-cream/40 border border-black/5 rounded-xl px-4 py-3 text-sm text-gold font-bold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={logout} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold transition-colors px-1 bg-red-50 hover:bg-red-100/60 py-2.5 px-5 rounded-2xl border border-red-100">
          <FiLogOut size={16}/> Logout from Account
        </button>

      </div>
    </div>
  )
}

export function StoryPage() {
  return (
    <div 
      className="bg-cover bg-center bg-no-repeat min-h-screen relative"
      style={{ 
        backgroundImage: `linear-gradient(rgba(17, 17, 17, 0.78), rgba(6, 4, 0, 0.84)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000')` 
      }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <div className="relative z-10 px-5 lg:px-[7%] py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 text-gold text-xs font-bold tracking-[4px] uppercase mb-4 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">
          🌾 Our Story
        </div>
        <h1 className="text-white font-extrabold mb-6 leading-tight" style={{ fontSize: 'clamp(32px,5vw,56px)' }}>
          Born from the Fields <span className="text-gold">of Odisha</span>
        </h1>
        <p className="text-white/75 text-sm leading-relaxed max-w-2xl mx-auto mb-16 font-medium">
          OdishaShop was founded with a simple mission — to connect the incredible farmers of Odisha directly with consumers across India, cutting out middlemen and ensuring fair prices for both sides.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            ['🌾', '2022', 'Founded in a small village in Odisha with just 3 farmer partners.'],
            ['🚀', '2023', 'Expanded to 20+ farmers across 5 districts of Odisha.'],
            ['❤️', '2026', '5000+ happy customers across India and growing every day.'],
          ].map(([emoji, year, desc]) => (
            <div key={year} className="bg-black/60 backdrop-blur-md border border-gold/20 rounded-3xl p-6 hover:border-gold hover:bg-black/80 transition-all duration-300 transform hover:-translate-y-1">
              <span className="text-3xl block mb-3">{emoji}</span>
              <div className="text-gold font-extrabold text-xl mb-2">{year}</div>
              <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          <div className="bg-black/55 backdrop-blur-md border border-gold/15 rounded-3xl p-8 hover:border-gold/30 transition-all">
            <h3 className="text-gold font-bold text-base mb-3.5 flex items-center gap-2">🌱 The Seeds of Change</h3>
            <p className="text-white/70 text-xs leading-relaxed">
              Every package of OdishaShop represents a deep-rooted tradition of natural, chemical-free agriculture. Our local farmers nurture native crops like unpolished Gota Biri, nutrient-rich Red Rice, and horse gram using organic fertilizers like Go-Bar (aged cow dung) and neem compost, preserving our ancient soil for generations to come.
            </p>
          </div>
          <div className="bg-black/55 backdrop-blur-md border border-gold/15 rounded-3xl p-8 hover:border-gold/30 transition-all">
            <h3 className="text-gold font-bold text-base mb-3.5 flex items-center gap-2">🤝 Supporting Our Farmers</h3>
            <p className="text-white/70 text-xs leading-relaxed">
              By cutting out exploitative middlemen and distributors, we return fair prices directly back to rural village cooperatives. We work side-by-side with heirloom seed guardians to protect traditional Odia crop biodiversity, transforming agricultural livelihoods across Nayagarh, Khurda, and coastal Odisha.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Unified Policy Dashboard ──────────────────────────────────────────────────
export function PolicyPage() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  const tabs = [
    { key: 'refund', label: 'Return & Refund', path: '/refund' },
    { key: 'shipping', label: 'Shipping Policy', path: '/shipping' },
    { key: 'terms', label: 'Terms & Conditions', path: '/terms' },
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy' },
    { key: 'faq', label: 'FAQs & Support', path: '/faq' },
  ]

  const activeTab = tabs.find(t => t.path === pathname)?.key || 'refund'

  return (
    <div className="bg-cream min-h-screen px-5 lg:px-[7%] py-12 text-left">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-extrabold text-3xl text-black mb-2">Store Policies</h1>
        <p className="text-gray-400 text-sm mb-10">Our commitment to transparency, quality, and consumer rights.</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-black/5 lg:pr-6 whitespace-nowrap scrollbar-none">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gold text-black shadow-md shadow-gold/10'
                    : 'bg-white text-gray-500 hover:text-gold hover:bg-gold/5 border border-black/5 lg:border-transparent'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-black/5 min-h-[500px]">
            {activeTab === 'refund' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-extrabold text-2xl text-black mb-1">Return &amp; Refund Policy</h2>
                  <div className="w-12 h-1 bg-gold rounded-full mt-2 mb-6"/>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  At OdishaShop, we are committed to delivering fresh, hygienically packed, and high-quality food products to our customers.
                </p>
                
                <div className="bg-gold/5 border border-gold/15 rounded-2xl p-5 text-sm text-gold-dark leading-relaxed">
                  ⚠️ <strong>Important Note:</strong> Because our products are food items, we <strong>do not accept general returns</strong> after delivery for safety and hygiene reasons.
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Non-Returnable Items</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Opened food packets</li>
                    <li>Used products</li>
                    <li>Products damaged by the customer</li>
                    <li>Improperly stored products after delivery</li>
                    <li>Change of mind purchases</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Customer Responsibility</h3>
                  <p className="text-sm text-gray-600">
                    Customers are requested to check the package carefully at the time of delivery.
                  </p>
                  <p className="text-sm text-gray-500 font-medium">OdishaShop will not be responsible for:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Damage caused after delivery</li>
                    <li>Mishandling by the customer</li>
                    <li>Incorrect storage conditions</li>
                    <li>Delivery delays caused due to wrong address or phone number provided by the customer</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Eligible Replacement / Refund Cases</h3>
                  <p className="text-sm text-gray-600">
                    Customers may contact us within <strong>24 hours of delivery</strong> if they receive:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Damaged package</li>
                    <li>Wrong product</li>
                    <li>Missing item</li>
                    <li>Open or leaking packet</li>
                  </ul>
                  <p className="text-sm text-gray-500 pt-2 font-medium">To request support, customers must provide:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Order ID</li>
                    <li>Clear photos/videos of the package and product</li>
                  </ul>
                  <p className="text-sm text-gray-500 pt-2 font-medium">After verification, OdishaShop may provide:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Replacement product only (if applicable)</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Refund is <strong>NOT</strong> possible after the order has been shipped.</li>
                    <li>Once the parcel is dispatched from OdishaShop, cancellation and refund requests will not be accepted.</li>
                    <li>Refunds are only applicable if OdishaShop fails to ship the order or sends the wrong product.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Cancellation Policy</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Orders can be cancelled <strong>only before shipping</strong>.</li>
                    <li>Once the order status becomes "Shipped", cancellation is not possible.</li>
                  </ul>
                </div>

                <p className="text-gray-500 text-xs italic pt-4">
                  OdishaShop reserves the right to reject refund or replacement requests if the request does not meet the above conditions.
                </p>

                <div className="border-t border-black/5 pt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">📧</div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">For support, please contact:</p>
                    <a href="mailto:support@odishashop.in" className="text-sm font-extrabold text-gold hover:underline">support@odishashop.in</a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-extrabold text-2xl text-black mb-1">Shipping &amp; Delivery Policy</h2>
                  <div className="w-12 h-1 bg-gold rounded-full mt-2 mb-6"/>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  We strive to dispatch your favorite organic agricultural products quickly and securely. Please read our shipping guidelines below:
                </p>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Shipping Charges</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li><strong>Free Shipping</strong> is applicable on all orders above <strong>₹499</strong>.</li>
                    <li>A flat delivery charge of <strong>₹49</strong> is applied on orders below ₹499.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Dispatch &amp; Delivery Time</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Orders are processed and dispatched within <strong>24–48 hours</strong> of receipt (excluding Sundays and public holidays).</li>
                    <li>Standard transit time across India is <strong>3 to 5 business days</strong> depending on your location.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">Order Tracking</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once dispatched, you will receive an SMS and email notification containing your shipping carrier's tracking ID and website link. You can track your order status live.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-extrabold text-2xl text-black mb-1">Terms &amp; Conditions</h2>
                  <div className="w-12 h-1 bg-gold rounded-full mt-2 mb-6"/>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  Welcome to OdishaShop. By accessing and browsing this website, you agree to comply with and be bound by the following terms of use:
                </p>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">1. Product Pricing &amp; Availability</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    All prices are listed in Indian Rupees (INR) and are inclusive of standard local taxes. Product availability is subject to seasonal changes. OdishaShop reserves the right to cancel orders in case of stock unavailability.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">2. User Account Security</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You are solely responsible for maintaining the confidentiality of your account credentials (email and password/OTP). Any activities that occur under your account remain your legal responsibility.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">3. Governing Law</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Any disputes arising out of the use of this website or orders placed through OdishaShop are subject exclusively to the jurisdiction of the local courts of Jaipur, Odisha, India.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-extrabold text-2xl text-black mb-1">Privacy Policy</h2>
                  <div className="w-12 h-1 bg-gold rounded-full mt-2 mb-6"/>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  OdishaShop respects your personal privacy. This privacy policy explains how we collect, store, and protect your information:
                </p>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">1. Information We Collect</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We collect personal information necessary to deliver your orders, including your full name, email address, physical shipping address, postal code, and contact phone number.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">2. Data Safety &amp; Protection</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your connection to our portal is secured using SSL/TLS encryption protocols. We use trusted third-party payment gateways (like Razorpay) which process your card and bank details in a PCI-DSS compliant environment. We do not store your credit card or bank details on our servers.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-base text-black">3. Zero Spam Guarantee</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We will never sell, rent, or lease your personal information to third parties. We use your details solely for order fulfillment and customer service updates.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-extrabold text-2xl text-black mb-1">FAQs &amp; Support</h2>
                  <div className="w-12 h-1 bg-gold rounded-full mt-2 mb-6"/>
                </div>

                <div className="space-y-4">
                  {[
                    ['Q: Are your agricultural products 100% organic?', 'Yes. All our products are sourced directly from registered farmers across Odisha who prioritize traditional, organic, and natural farming methods.'],
                    ['Q: How long does delivery take?', 'Dispatches are made in 24–48 hours, and standard couriers take 3–5 business days to reach your doorstep.'],
                    ['Q: Can I cancel my order?', 'Yes, but only before it has been shipped. Once marked as "Shipped", cancellation is strictly not possible.'],
                    ['Q: Do you offer Cash on Delivery (COD)?', 'Yes, Cash on Delivery is available across most pincodes in India.'],
                  ].map(([q, a], idx) => (
                    <div key={idx} className="border-b border-black/5 pb-4 last:border-b-0 last:pb-0">
                      <p className="font-extrabold text-sm text-black mb-1">{q}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
