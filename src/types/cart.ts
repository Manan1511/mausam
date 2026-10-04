import type { HomepageContent, StoreProduct, StoreProductCategory } from './shopify'

export const MAUSAM_CART_STORAGE_KEY = 'mausam_artwork_cart_v1'
export const SHOPIFY_CART_STORAGE_KEY = 'mausam_artwork_shopify_cart_id_v1'
export const DEFAULT_CURRENCY = 'INR'
export const COMPLIMENTARY_SHIPPING_LABEL = 'Complimentary Atelier Delivery'

export interface CartItem {
  id: string
  variantId: string
  name: string
  variantTitle: string
  category: StoreProductCategory | null
  unitPrice: { amount: string; currencyCode: string }
  image: string
  quantity: number
  subtitle?: string
}

export interface CartContextType {
  mode: 'preview' | 'live'
  status: 'loading' | 'ready' | 'unavailable'
  products: StoreProduct[]
  featuredProducts: StoreProduct[]
  homepageContent: HomepageContent | null
  homepageStatus: 'loading' | 'ready' | 'unavailable'
  items: CartItem[]
  isCartOpen: boolean
  isCheckoutOpen: boolean
  isCartMutating: boolean
  cartError: string | null
  totalItems: number
  subtotalAmount: string
  subtotalCurrencyCode: string
  subtotalFormatted: string
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  addItem: (product: StoreProduct, variantId: string, quantity?: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  checkout: () => Promise<void>
}
