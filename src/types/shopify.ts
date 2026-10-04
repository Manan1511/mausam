export type StoreProductCategory = 'candles' | 'bouquets'

export interface StoreVariant {
  id: string
  title: string
  sku: string | null
  availableForSale: boolean
  price: {
    amount: string
    currencyCode: string
  }
  selectedOptions: Array<{ name: string; value: string }>
}

export interface StoreProduct {
  id: string
  handle: string
  title: string
  category: StoreProductCategory | null
  subtitle: string
  badge: string | null
  description: string
  vendor: string
  availableForSale: boolean
  image: { url: string; altText: string | null } | null
  priceRange: {
    min: { amount: string; currencyCode: string }
    max: { amount: string; currencyCode: string }
  }
  variants: StoreVariant[]
  specs: {
    burnTime?: string
    material?: string
    scentNotes?: string
  }
}

export interface StorefrontMedia {
  id: string
  url: string
  altText: string | null
}

export interface HomepageContent {
  announcement: { enabled: boolean; text: string }
  hero: {
    eyebrow: string
    title: string
    body: string
    primaryCtaLabel: string
    primaryCtaHref: string
    secondaryCtaLabel: string
    secondaryCtaHref: string
    image: StorefrontMedia | null
    mobileImage: StorefrontMedia | null
  }
  gifting: {
    eyebrow: string
    title: string
    body: string
    ctaLabel: string
    ctaHref: string
    image: StorefrontMedia | null
  }
  craftsmanship: {
    eyebrow: string
    title: string
    body: string
    image: StorefrontMedia | null
  }
  editorial: {
    eyebrow: string
    title: string
    body: string
    ctaLabel: string
    ctaHref: string
    image: StorefrontMedia | null
  }
  featuredProductIds: string[]
}

export interface StorefrontStatus {
  mode: 'preview' | 'live'
  setupRequired: boolean
}

export interface StorefrontCartLine {
  id: string
  variantId: string
  quantity: number
  title: string
  variantTitle: string
  productHandle: string
  category: StoreProductCategory | null
  imageUrl: string | null
  unitPrice: { amount: string; currencyCode: string }
}

export interface StorefrontCart {
  id: string
  checkoutUrl: string | null
  lines: StorefrontCartLine[]
  subtotal: { amount: string; currencyCode: string }
  total: { amount: string; currencyCode: string }
}

export type CartOperation =
  | { action: 'create' }
  | { action: 'read'; cartId: string }
  | { action: 'add'; cartId?: string; variantId: string; quantity: number }
  | { action: 'update'; cartId: string; lineId: string; quantity: number }
  | { action: 'remove'; cartId: string; lineId: string }
  | { action: 'checkout'; cartId: string }
