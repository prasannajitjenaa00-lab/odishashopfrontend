import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPackage, FiUsers, FiShoppingBag, FiTrendingUp, FiPlus, 
  FiEdit2, FiTrash2, FiX, FiCheck, FiUpload, FiLogOut, FiFolder, FiGrid, FiTruck, FiAlertTriangle
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Protect Admin route client-side
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login')
      } else if (user.role !== 'admin') {
        navigate('/')
      }
    }
  }, [user, authLoading, navigate])

  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)

  // Data states
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 })
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  // Modals & form states
  const [showProductModal, setShowProductModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [productForm, setProductForm] = useState({ 
    productName: '', price: '', weight: '1kg', category: 'Dal', stock: '', description: '', image: '', featured: false 
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ categoryName: '', categoryImage: '' })

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderForm, setOrderForm] = useState({ status: 'Pending', courierName: '', trackingId: '' })

  const fileInputRef = useRef(null)
  const categoryFileInputRef = useRef(null)

  // Fetch admin stats and data
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch products
      const { data: prodData } = await api.get('/products?limit=100')
      const allProducts = prodData.products || prodData
      setProducts(allProducts)

      // 2. Fetch categories
      const { data: catData } = await api.get('/categories')
      setCategories(catData)

      // 3. Fetch orders
      const { data: ordData } = await api.get('/orders')
      const allOrders = ordData.orders || ordData
      setOrders(allOrders)

      // 4. Fetch users
      const { data: userData } = await api.get('/admin/users')
      setUsers(userData)

      // 5. Fetch analytics
      const { data: analyticData } = await api.get('/orders/analytics')
      setStats({
        totalProducts: allProducts.length,
        totalOrders: analyticData.totalOrders || allOrders.length,
        totalUsers: userData.length,
        totalRevenue: analyticData.totalRevenue || 0
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData()
    }
  }, [user])

  // --- Image Upload Handler ---
  const handleImageUpload = async (e, type = 'product') => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploadingImage(true)
    const toastId = toast.loading('Uploading image...')
    try {
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Image uploaded successfully', { id: toastId })
      
      if (type === 'product') {
        setProductForm(prev => ({ ...prev, image: data.imageUrl }))
      } else {
        setCategoryForm(prev => ({ ...prev, categoryImage: data.imageUrl }))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Image upload failed', { id: toastId })
    } finally {
      setUploadingImage(false)
    }
  }

  // --- Product CRUD Functions ---
  const handleProductEdit = (p) => {
    setEditProduct(p)
    setProductForm({
      productName: p.name,
      price: p.price,
      weight: p.weight || '1kg',
      category: p.category,
      stock: p.stock,
      description: p.description,
      image: p.image || '',
      featured: p.isFeatured || false
    })
    setShowProductModal(true)
  }

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted successfully', { style: { background: '#111', color: '#fff', border: '1px solid #C8A951' } })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleProductSave = async (e) => {
    e.preventDefault()
    if (!productForm.productName || !productForm.price || !productForm.stock || !productForm.description) {
      return toast.error('Please complete all required fields')
    }

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, productForm)
        toast.success('Product updated successfully!')
      } else {
        await api.post('/products', productForm)
        toast.success('Product added successfully!')
      }
      setShowProductModal(false)
      setEditProduct(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    }
  }

  // --- Category CRUD Functions ---
  const handleCategoryEdit = (c) => {
    setEditCategory(c)
    setCategoryForm({
      categoryName: c.categoryName,
      categoryImage: c.categoryImage
    })
    setShowCategoryModal(true)
  }

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleCategorySave = async (e) => {
    e.preventDefault()
    if (!categoryForm.categoryName || !categoryForm.categoryImage) {
      return toast.error('Please complete all required fields')
    }

    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory._id}`, categoryForm)
        toast.success('Category updated successfully!')
      } else {
        await api.post('/categories', categoryForm)
        toast.success('Category added successfully!')
      }
      setShowCategoryModal(false)
      setEditCategory(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category')
    }
  }

  // --- Order Tracking & Status Update ---
  const handleOrderClick = (o) => {
    setSelectedOrder(o)
    setOrderForm({
      status: o.status,
      courierName: o.courierName || '',
      trackingId: o.trackingId || ''
    })
  }

  const handleOrderUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, orderForm)
      toast.success('Order status and tracking updated!')
      setSelectedOrder(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order')
    }
  }

  // --- User Block & Delete Operations ---
  const handleUserBlock = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/block`)
      toast.success(data.message)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Block action failed')
    }
  }

  const handleUserDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted successfully')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete action failed')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-5">
        <div>
          <div className="text-5xl mb-4 animate-spin text-gold">⏳</div>
          <h2 className="text-xl font-bold">Verifying authorization...</h2>
        </div>
      </div>
    )
  }

  const lowStockProducts = products.filter(p => p.stock < 20)

  return (
    <div className="bg-cream min-h-screen">
      {/* Admin Header */}
      <header className="bg-[#111] border-b border-gold/20 px-5 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ODISHASHOP" className="w-9 h-9 object-contain rounded-full border border-gold/30 p-0.5 bg-white/5" />
          <div>
            <div className="text-gold font-extrabold text-lg tracking-wider leading-none">ODISHASHOP</div>
            <div className="text-white/30 text-[9px] tracking-[2px] uppercase mt-1">Admin Control Room</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-white text-xs font-bold leading-tight">{user.name}</div>
              <div className="text-gold/60 text-[9px] uppercase tracking-wider font-semibold">Super Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <FiLogOut size={16}/>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-black/6 min-h-[calc(100vh-68px)] hidden md:flex flex-col pt-6 px-4 gap-1.5 justify-between pb-8">
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FiGrid size={16}/> },
              { id: 'products', label: 'Products', icon: <FiPackage size={16}/> },
              { id: 'categories', label: 'Categories', icon: <FiFolder size={16}/> },
              { id: 'orders', label: 'Orders', icon: <FiShoppingBag size={16}/> },
              { id: 'users', label: 'Users', icon: <FiUsers size={16}/> },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                  activeTab === t.id 
                    ? 'bg-gold text-black shadow-md shadow-gold/25' 
                    : 'text-gray-500 hover:bg-cream hover:text-black'
                }`}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-red-500 hover:bg-red-50 transition-colors">
            <FiLogOut size={16}/>
            Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-5 lg:px-8 py-8 overflow-x-hidden">
          {/* Mobile Bottom Tabs */}
          <div className="flex gap-1.5 mb-6 md:hidden">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'products', label: 'Products' },
              { id: 'categories', label: 'Cats' },
              { id: 'orders', label: 'Orders' },
              { id: 'users', label: 'Users' }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 text-[10px] font-extrabold tracking-wider uppercase rounded-xl transition-all ${
                  activeTab === t.id ? 'bg-gold text-black' : 'bg-white text-gray-400 border border-black/8'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
            </div>
          )}

          {!loading && (
            <AnimatePresence mode="wait">
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                    <h2 className="font-extrabold text-2xl text-black">Dashboard Overview</h2>
                    <button onClick={fetchData} className="btn-gold py-2 px-4 rounded-xl text-xs self-start sm:self-auto">
                      Refresh Data
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { icon: <FiTrendingUp size={20}/>, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}` },
                      { icon: <FiShoppingBag size={20}/>, label: 'Total Orders', value: stats.totalOrders },
                      { icon: <FiUsers size={20}/>, label: 'Registered Users', value: stats.totalUsers },
                      { icon: <FiPackage size={20}/>, label: 'Active Products', value: stats.totalProducts },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 hover:border-gold/30 transition-all hover:shadow-md">
                        <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-4">
                          {s.icon}
                        </div>
                        <div className="font-extrabold text-2xl text-black leading-none">{s.value}</div>
                        <div className="text-gray-400 text-xs mt-2 uppercase tracking-wider font-semibold">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden lg:col-span-2">
                      <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between">
                        <h3 className="font-extrabold text-base">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-gold text-xs font-bold tracking-wider uppercase hover:underline">View All</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-cream text-gray-400 text-xs">
                              {['ID','Customer','Status','Amount','Date'].map(h => (
                                <th key={h} className="text-left px-5 py-3 font-bold tracking-wider uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 5).map(o => (
                              <tr key={o._id} onClick={() => handleOrderClick(o)} className="border-t border-black/4 hover:bg-cream/40 transition-colors cursor-pointer">
                                <td className="px-5 py-3.5 text-gold font-bold text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                                <td className="px-5 py-3.5 font-medium">{o.shippingAddress?.name || o.user?.name || 'Customer'}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                                    o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    o.status === 'Shipped' ? 'bg-yellow-100 text-yellow-700' :
                                    o.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                  }`}>{o.status}</span>
                                </td>
                                <td className="px-5 py-3.5 font-bold">₹{o.totalPrice}</td>
                                <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                            {orders.length === 0 && (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-gray-400">No orders recorded yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col">
                      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-black/5">
                        <FiAlertTriangle className="text-red-500" size={20}/>
                        <h3 className="font-extrabold text-base">Low Stock Products</h3>
                      </div>
                      <div className="space-y-4 flex-1 overflow-y-auto max-h-[290px] pr-1">
                        {lowStockProducts.map(p => (
                          <div key={p._id} className="flex justify-between items-center bg-cream/50 rounded-2xl p-3 border border-black/4">
                            <div className="text-left">
                              <p className="font-bold text-sm text-black">{p.name}</p>
                              <p className="text-[11px] text-gray-400">{p.category} · {p.weight}</p>
                            </div>
                            <span className="bg-red-50 text-red-500 font-extrabold text-xs px-3 py-1 rounded-xl">
                              {p.stock} units
                            </span>
                          </div>
                        ))}
                        {lowStockProducts.length === 0 && (
                          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                            <span className="text-3xl">✨</span>
                            <span className="text-xs font-semibold">All products fully stocked!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-extrabold text-2xl text-black">Product Management ({products.length})</h2>
                    <button onClick={() => { setEditProduct(null); setProductForm({ productName: '', price: '', weight: '1kg', category: categories[0]?.categoryName || 'Rice', stock: '', description: '', image: '', featured: false }); setShowProductModal(true) }}
                      className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs">
                      <FiPlus size={14}/> Add Product
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-cream text-gray-400 text-xs">
                            {['Image', 'Name','Category','Price','Stock','Status','Actions'].map(h => (
                              <th key={h} className="text-left px-5 py-3 font-bold tracking-wider uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(p => (
                            <tr key={p._id} className="border-t border-black/4 hover:bg-cream/40 transition-colors">
                              <td className="px-5 py-3">
                                <img src={p.image || '/logo.png'} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-black/10 bg-cream" />
                              </td>
                              <td className="px-5 py-3 font-bold">{p.name} {p.isFeatured && <span className="bg-gold/20 text-gold border border-gold/30 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1">Featured</span>}</td>
                              <td className="px-5 py-3"><span className="bg-black/5 text-xs font-semibold px-2.5 py-0.5 rounded-full">{p.category}</span></td>
                              <td className="px-5 py-3 font-bold text-gold">₹{p.price}</td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-extrabold ${p.stock < 20 ? 'text-red-500' : 'text-green-600'}`}>{p.stock} units</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                  {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => handleProductEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors"><FiEdit2 size={13}/></button>
                                  <button onClick={() => handleProductDelete(p._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"><FiTrash2 size={13}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <motion.div key="categories" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-extrabold text-2xl text-black">Category Management ({categories.length})</h2>
                    <button onClick={() => { setEditCategory(null); setCategoryForm({ categoryName: '', categoryImage: '' }); setShowCategoryModal(true) }}
                      className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs">
                      <FiPlus size={14}/> Add Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {categories.map(c => (
                      <div key={c._id} className="bg-white rounded-3xl p-5 border border-black/5 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <img src={c.categoryImage || '/logo.png'} alt={c.categoryName} className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-gold/20 p-0.5 bg-cream mb-4" />
                          <h3 className="font-extrabold text-base text-black mb-1">{c.categoryName}</h3>
                        </div>
                        <div className="flex gap-2.5 mt-5">
                          <button onClick={() => handleCategoryEdit(c)} className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5">
                            <FiEdit2 size={12}/> Edit
                          </button>
                          <button onClick={() => handleCategoryDelete(c._id)} className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                            <FiTrash2 size={12}/> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-black/5 text-gray-400">
                        No categories found. Click Add Category to create one.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: ORDERS */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-extrabold text-2xl text-black mb-6">Order Control ({orders.length})</h2>

                  <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-cream text-gray-400 text-xs">
                            {['Order ID','Customer','Phone','Payment','Total','Date','Status','Action'].map(h => (
                              <th key={h} className="text-left px-5 py-3 font-bold tracking-wider uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o._id} className="border-t border-black/4 hover:bg-cream/40 transition-colors">
                              <td className="px-5 py-4 text-gold font-bold text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                              <td className="px-5 py-4 font-bold text-black">{o.shippingAddress?.name || o.user?.name || 'Customer'}</td>
                              <td className="px-5 py-4 text-gray-500">{o.shippingAddress?.phone || 'N/A'}</td>
                              <td className="px-5 py-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {o.isPaid ? 'Paid' : 'COD'}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-extrabold text-black">₹{o.totalPrice}</td>
                              <td className="px-5 py-4 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                  o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  o.status === 'Shipped' ? 'bg-yellow-100 text-yellow-700' :
                                  o.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>{o.status}</span>
                              </td>
                              <td className="px-5 py-4">
                                <button onClick={() => handleOrderClick(o)} className="text-gold hover:underline font-extrabold text-xs tracking-wider uppercase">
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: USERS */}
              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-extrabold text-2xl text-black mb-6">User Database ({users.length})</h2>

                  <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-cream text-gray-400 text-xs">
                            {['Name','Email','Role','Status','Joined Date','Actions'].map(h => (
                              <th key={h} className="text-left px-5 py-3 font-bold tracking-wider uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} className="border-t border-black/4 hover:bg-cream/40 transition-colors">
                              <td className="px-5 py-4 font-bold text-black">{u.name}</td>
                              <td className="px-5 py-4 text-gray-500">{u.email}</td>
                              <td className="px-5 py-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                  {u.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-5 py-4">
                                <div className="flex gap-2">
                                  {u.role !== 'admin' && (
                                    <>
                                      <button onClick={() => handleUserBlock(u._id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                          u.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                        }`}>
                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                      </button>
                                      <button onClick={() => handleUserDelete(u._id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                                        <FiTrash2 size={13}/>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── PRODUCT MODAL ── */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center px-5 backdrop-blur-sm overflow-y-auto py-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-xl">{editProduct ? 'Modify Product' : 'Add Premium Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-black transition-colors"><FiX size={20}/></button>
            </div>
            
            <form onSubmit={handleProductSave} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Product Name *</label>
                  <input type="text" required value={productForm.productName} onChange={e => setProductForm(f => ({...f, productName: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Weight / Volume *</label>
                  <input type="text" required placeholder="e.g. 1kg" value={productForm.weight} onChange={e => setProductForm(f => ({...f, weight: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Price (₹) *</label>
                  <input type="number" required min="0" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Stock (Units) *</label>
                  <input type="number" required min="0" value={productForm.stock} onChange={e => setProductForm(f => ({...f, stock: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Category *</label>
                  <select value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors bg-white font-medium">
                    {categories.map(c => <option key={c._id} value={c.categoryName}>{c.categoryName}</option>)}
                    {categories.length === 0 && (
                      <>
                        <option>Rice</option>
                        <option>Dal</option>
                        <option>Spices</option>
                        <option>Oil</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex items-center mt-6 pl-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(f => ({...f, featured: e.target.checked}))}
                      className="w-4.5 h-4.5 rounded text-gold border-black/10 focus:ring-gold" />
                    <span className="text-xs font-bold text-black uppercase tracking-wider">Featured Item</span>
                  </label>
                </div>
              </div>

              {/* Product Image Uploader */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Product Image URL *</label>
                <div className="flex gap-2">
                  <input type="text" required placeholder="/gota-biri.png or uploads/" value={productForm.image} onChange={e => setProductForm(f => ({...f, image: e.target.value}))}
                    className="flex-1 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                  <button type="button" disabled={uploadingImage} onClick={() => fileInputRef.current.click()}
                    className="btn-gold flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold disabled:opacity-50">
                    <FiUpload size={14}/>
                    Upload
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} />
                </div>
                {productForm.image && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-cream rounded-2xl border border-black/5">
                    <img src={productForm.image} alt="Preview" className="w-12 h-12 object-cover rounded-xl border" />
                    <span className="text-xs font-semibold text-gray-400 truncate max-w-[300px]">{productForm.image}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Detailed Description *</label>
                <textarea required value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} rows={3}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors resize-none"/>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-black/5">
                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 border border-black/10 rounded-xl py-3 text-sm font-bold text-gray-500 hover:border-gold hover:text-gold transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs">
                  <FiCheck size={14}/> {editProduct ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── CATEGORY MODAL ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center px-5 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-xl">{editCategory ? 'Modify Category' : 'Create Category'}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-black transition-colors"><FiX size={20}/></button>
            </div>
            
            <form onSubmit={handleCategorySave} className="space-y-5 text-left">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Category Name *</label>
                <input type="text" required placeholder="e.g. Spices" value={categoryForm.categoryName} onChange={e => setCategoryForm(f => ({...f, categoryName: e.target.value}))}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Category Thumbnail URL *</label>
                <div className="flex gap-2">
                  <input type="text" required placeholder="/spices.png or uploads/" value={categoryForm.categoryImage} onChange={e => setCategoryForm(f => ({...f, categoryImage: e.target.value}))}
                    className="flex-1 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"/>
                  <button type="button" disabled={uploadingImage} onClick={() => categoryFileInputRef.current.click()}
                    className="btn-gold flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold disabled:opacity-50">
                    <FiUpload size={14}/>
                    Upload
                  </button>
                  <input type="file" ref={categoryFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'category')} />
                </div>
                {categoryForm.categoryImage && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-cream rounded-2xl border border-black/5">
                    <img src={categoryForm.categoryImage} alt="Preview" className="w-12 h-12 object-cover rounded-xl border" />
                    <span className="text-xs font-semibold text-gray-400 truncate max-w-[240px]">{categoryForm.categoryImage}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-black/5">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 border border-black/10 rounded-xl py-3 text-sm font-bold text-gray-500 hover:border-gold hover:text-gold transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs">
                  <FiCheck size={14}/> {editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── ORDER DETAILS / STATUS MANAGE MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center px-5 backdrop-blur-sm overflow-y-auto py-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl my-auto text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
              <div>
                <h3 className="font-extrabold text-xl text-black">Manage Order</h3>
                <p className="text-xs text-gray-400 mt-1">ID: #{selectedOrder._id} · Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black transition-colors"><FiX size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column: Customer details */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-sm text-gold uppercase tracking-wider">Customer Details</h4>
                <div className="bg-cream/50 border border-black/4 p-4 rounded-2xl space-y-2 text-xs leading-relaxed">
                  <p><strong className="text-black font-semibold">Name:</strong> {selectedOrder.shippingAddress?.name || selectedOrder.user?.name || 'N/A'}</p>
                  <p><strong className="text-black font-semibold">Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  <p><strong className="text-black font-semibold">Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p>
                    <strong className="text-black font-semibold">Address:</strong><br />
                    {selectedOrder.shippingAddress?.line1}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Right Column: Ordered Items */}
              <div className="space-y-3.5">
                <h4 className="font-bold text-sm text-gold uppercase tracking-wider">Items Ordered</h4>
                <div className="bg-cream/50 border border-black/4 p-4 rounded-2xl text-xs space-y-2.5 max-h-[160px] overflow-y-auto">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-2 border-b border-black/4 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-bold text-black">{item.name}</p>
                        <p className="text-gray-400 text-[10px]">{item.weight || '1kg'} x {item.qty}</p>
                      </div>
                      <span className="font-extrabold text-black">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold text-sm border-t border-black/10">
                    <span className="text-black">Total Paid:</span>
                    <span className="text-gold text-base">₹{selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking and Status Update Form */}
            <form onSubmit={handleOrderUpdate} className="space-y-4 border-t border-black/5 pt-5">
              <h4 className="font-bold text-sm text-gold uppercase tracking-wider mb-2">Delivery &amp; Tracking Configuration</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Order Status</label>
                  <select value={orderForm.status} onChange={e => setOrderForm(f => ({...f, status: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors bg-white">
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Courier Partner</label>
                  <input type="text" placeholder="e.g. Delhivery" value={orderForm.courierName} onChange={e => setOrderForm(f => ({...f, courierName: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-gold transition-colors"/>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tracking ID</label>
                  <input type="text" placeholder="e.g. DEL123456789" value={orderForm.trackingId} onChange={e => setOrderForm(f => ({...f, trackingId: e.target.value}))}
                    className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-gold transition-colors"/>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-black/5">
                <button type="button" onClick={() => setSelectedOrder(null)} className="flex-1 border border-black/10 rounded-xl py-3 text-xs font-bold text-gray-500 hover:border-gold hover:text-gold transition-all uppercase tracking-wider">Close</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <FiCheck size={14}/> Save Tracking Info
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
