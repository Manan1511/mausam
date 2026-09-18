import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  MAUSAM_CART_STORAGE_KEY,
  type CartItem,
  type AddCartItemInput,
} from '../types/cart'
import { formatPriceINR } from '../utils/cartUtils'
import { CartContext } from './cartContextDef'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(MAUSAM_CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MAUSAM_CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [items])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const openCheckout = useCallback(() => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }, [])

  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), [])

  const addItem = useCallback((input: AddCartItemInput) => {
    const qtyToAdd = input.quantity ?? 1
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === input.id)
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        )
      }
      return [...prev, { ...input, quantity: qtyToAdd }]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotalFormatted = formatPriceINR(subtotal)

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        isCheckoutOpen,
        totalItems,
        subtotal,
        subtotalFormatted,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
