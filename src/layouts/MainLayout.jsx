import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import CartSidebar from '../components/Cart/CartSidebar'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Admin redirect logic removed so admins can browse the public storefront

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
    </div>
  )
}
