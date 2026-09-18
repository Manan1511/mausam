import { type ProductCategory } from '../data'

export const MAUSAM_CART_STORAGE_KEY = 'mausam_artwork_cart_v1'
export const ORDERS_STORAGE_KEY = 'mausam_artwork_orders_v1'
export const DEFAULT_CURRENCY = '₹'
export const COMPLIMENTARY_SHIPPING_LABEL = 'Complimentary Atelier Delivery'
export const PINCODE_LENGTH = 6
export const PHONE_MIN_DIGITS = 10

export interface CartItem {
  id: string
  name: string
  category: ProductCategory
  price: number
  priceFormatted: string
  image: string
  quantity: number
  subtitle?: string
}

export type AddCartItemInput = Omit<CartItem, 'quantity'> & { quantity?: number }

export interface ShippingAddress {
  fullName: string
  phone: string
  email: string
  addressLine: string
  city: string
  state: string
  pincode: string
  giftNote?: string
}

export interface PlacedOrder {
  orderId: string
  createdAt: string
  items: CartItem[]
  subtotal: number
  shipping: string
  shippingAddress: ShippingAddress
  paymentStatus: 'Pending Atelier Confirmation'
}

export interface CartContextType {
  items: CartItem[]
  isCartOpen: boolean
  isCheckoutOpen: boolean
  totalItems: number
  subtotal: number
  subtotalFormatted: string
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  addItem: (item: AddCartItemInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
}
