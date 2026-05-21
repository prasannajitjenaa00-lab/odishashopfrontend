import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('odisha_cart')) || [] } catch { return [] }
  })
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('odisha_wishlist')) || [] } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('odisha_cart', JSON.stringify(cartItems)) }, [cartItems])
  useEffect(() => { localStorage.setItem('odisha_wishlist', JSON.stringify(wishlist)) }, [wishlist])

  const addToCart = (product) => {
    if (product.stock <= 0) return
    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id)
      if (exists) {
        if (exists.qty >= product.stock) return prev
        return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i._id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCartItems(prev => prev.map(i => {
      if (i._id === id) {
        const allowedQty = i.stock !== undefined ? Math.min(qty, i.stock) : qty
        return { ...i, qty: allowedQty }
      }
      return i
    }))
  }

  const clearCart = () => setCartItems([])

  const toggleWishlist = (product) => {
    setWishlist(prev =>
      prev.find(i => i._id === product._id)
        ? prev.filter(i => i._id !== product._id)
        : [...prev, product]
    )
  }

  const isWishlisted = (id) => wishlist.some(i => i._id === id)
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
