import { createContext, useContext } from 'react'
import type { CartContextType } from '../types/cart'

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
