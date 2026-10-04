import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  MAUSAM_CART_STORAGE_KEY,
  SHOPIFY_CART_STORAGE_KEY,
  type CartItem,
  type CartContextType,
} from '../types/cart'
import type { HomepageContent, StoreProduct, StorefrontCart } from '../types/shopify'
import { previewFeaturedProducts, previewProducts } from '../services/previewCatalog'
import { storefrontApi, storefrontBuildMode } from '../services/storefrontApi'
import { formatMoney } from '../utils/cartUtils'
import { CartContext } from './cartContextDef'

function parseQuantity(value: unknown): number {
  const quantity = Number(value)
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 99 ? quantity : 1
}

function readPreviewCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(MAUSAM_CART_STORAGE_KEY)
    const value: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(value)) return []

    return value.flatMap((item: unknown) => {
      if (typeof item !== 'object' || item === null || !('id' in item) || !('name' in item)) {
        return []
      }

      const source = item as Record<string, unknown>
      const id = String(source.id).slice(0, 160)
      const variantId = typeof source.variantId === 'string'
        ? source.variantId.slice(0, 200)
        : `preview:legacy:${id}`
      const unitPrice =
        typeof source.unitPrice === 'object' && source.unitPrice !== null &&
        'amount' in source.unitPrice && 'currencyCode' in source.unitPrice
          ? {
              amount: String(source.unitPrice.amount).slice(0, 40),
              currencyCode: String(source.unitPrice.currencyCode).slice(0, 3),
            }
          : {
              amount: (Number(source.price) || 0).toFixed(2),
              currencyCode: 'INR',
            }
      const category = source.category === 'candles' || source.category === 'bouquets'
        ? source.category
        : null

      return [{
        id: source.id === variantId ? id : variantId,
        variantId,
        name: String(source.name).slice(0, 180),
        variantTitle: typeof source.variantTitle === 'string' ? source.variantTitle.slice(0, 120) : 'Standard',
        category,
        unitPrice,
        image: typeof source.image === 'string' ? source.image.slice(0, 1000) : '',
        quantity: parseQuantity(source.quantity),
        subtitle: typeof source.subtitle === 'string' ? source.subtitle.slice(0, 240) : undefined,
      }]
    })
  } catch {
    return []
  }
}

function itemsFromShopifyCart(cart: StorefrontCart): CartItem[] {
  return cart.lines.map((line) => ({
    id: line.id,
    variantId: line.variantId,
    name: line.title,
    variantTitle: line.variantTitle,
    category: line.category,
    unitPrice: line.unitPrice,
    image: line.imageUrl ?? '',
    quantity: line.quantity,
  }))
}

function getStoredShopifyCartId(): string | null {
  try {
    return localStorage.getItem(SHOPIFY_CART_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveShopifyCartId(cartId: string | null) {
  try {
    if (cartId) localStorage.setItem(SHOPIFY_CART_STORAGE_KEY, cartId)
    else localStorage.removeItem(SHOPIFY_CART_STORAGE_KEY)
  } catch {
    // The current cart remains usable for this tab if storage is unavailable.
  }
}

function clearPreviewCart() {
  try {
    localStorage.removeItem(MAUSAM_CART_STORAGE_KEY)
  } catch {
    // Storage unavailable.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'preview' | 'live'>(storefrontBuildMode)
  const [status, setStatus] = useState<CartContextType['status']>('loading')
  const [products, setProducts] = useState<StoreProduct[]>(
    storefrontBuildMode === 'preview' ? previewProducts : [],
  )
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>(
    storefrontBuildMode === 'preview' ? previewFeaturedProducts : [],
  )
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null)
  const [homepageStatus, setHomepageStatus] = useState<CartContextType['homepageStatus']>('loading')
  const [items, setItems] = useState<CartItem[]>([])
  const [shopifyCart, setShopifyCart] = useState<StorefrontCart | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isCartMutating, setIsCartMutating] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const cartMutationInFlight = useRef(false)

  useEffect(() => {
    let active = true

    const loadStorefront = async () => {
      let liveModeConfirmed = false
      try {
        if (storefrontBuildMode === 'live') clearPreviewCart()
        const storefrontStatus = await storefrontApi.getStatus()
        if (!active) return

        if (storefrontStatus.mode !== 'live') {
          setMode('preview')
          setProducts(previewProducts)
          setFeaturedProducts(previewFeaturedProducts)
          setHomepageContent(null)
          setHomepageStatus('ready')
          setItems(readPreviewCart())
          setStatus('ready')
          return
        }

        liveModeConfirmed = true
        clearPreviewCart()
        setMode('live')
        setStatus('loading')
        setProducts([])
        setFeaturedProducts([])

        const [catalogResult, homepageResult] = await Promise.allSettled([
          storefrontApi.getCatalog(),
          storefrontApi.getHomepageContent(),
        ])
        if (!active) return
        if (catalogResult.status === 'rejected') throw catalogResult.reason

        const liveProducts = catalogResult.value
        const content = homepageResult.status === 'fulfilled' ? homepageResult.value : null
        setProducts(liveProducts)
        setHomepageContent(content)
        setHomepageStatus(homepageResult.status === 'fulfilled' ? 'ready' : 'unavailable')
        if (content) {
          const byId = new Map(liveProducts.map((product) => [product.id, product]))
          setFeaturedProducts(
            content.featuredProductIds.flatMap((id) => {
              const product = byId.get(id)
              return product ? [product] : []
            }),
          )
        }

        const savedCartId = getStoredShopifyCartId()
        if (savedCartId) {
          try {
            const cart = await storefrontApi.mutateCart({ action: 'read', cartId: savedCartId })
            if (!active) return
            setShopifyCart(cart)
            setItems(itemsFromShopifyCart(cart))
          } catch {
            saveShopifyCartId(null)
          }
        }
        setStatus('ready')
      } catch {
        if (!active) return
        if (!liveModeConfirmed && storefrontBuildMode === 'preview') {
          setMode('preview')
          setProducts(previewProducts)
          setFeaturedProducts(previewFeaturedProducts)
          setHomepageContent(null)
          setHomepageStatus('ready')
          setItems(readPreviewCart())
          setStatus('ready')
        } else {
          setMode('live')
          setProducts([])
          setFeaturedProducts([])
          setHomepageStatus('unavailable')
          setCartError('The Shopify storefront is unavailable. Please try again shortly.')
          setStatus('unavailable')
        }
      }
    }

    void loadStorefront()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (mode !== 'preview' || status !== 'ready') return
    try {
      localStorage.setItem(MAUSAM_CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage unavailable or quota exceeded.
    }
  }, [items, mode, status])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const openCheckout = useCallback(() => {
    setCartError(null)
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }, [])
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), [])

  const applyShopifyOperation = useCallback(async (operation: Parameters<typeof storefrontApi.mutateCart>[0]) => {
    if (cartMutationInFlight.current) return null
    cartMutationInFlight.current = true
    setIsCartMutating(true)
    setCartError(null)

    try {
      const cart = await storefrontApi.mutateCart(operation)
      setShopifyCart(cart)
      setItems(itemsFromShopifyCart(cart))
      saveShopifyCartId(cart.id)
      return cart
    } catch {
      setCartError('We could not update your bag. Please try again.')
      return null
    } finally {
      cartMutationInFlight.current = false
      setIsCartMutating(false)
    }
  }, [])

  const addItem = useCallback(async (product: StoreProduct, variantId: string, quantity = 1) => {
    if (status !== 'ready') return
    const variant = product.variants.find((candidate) => candidate.id === variantId)
    if (!variant?.availableForSale || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return
    }

    if (mode === 'preview') {
      setItems((previous) => {
        const existing = previous.find((item) => item.variantId === variantId)
        if (existing) {
          return previous.map((item) => item.variantId === variantId
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item)
        }

        return [
          ...previous,
          {
            id: variantId,
            variantId,
            name: product.title,
            variantTitle: variant.title,
            category: product.category,
            unitPrice: variant.price,
            image: product.image?.url ?? '',
            quantity,
            subtitle: product.subtitle,
          },
        ]
      })
      setIsCartOpen(true)
      return
    }

    const cartId = shopifyCart?.id ?? getStoredShopifyCartId() ?? undefined
    await applyShopifyOperation({
      action: 'add',
      ...(cartId ? { cartId } : {}),
      variantId,
      quantity,
    })
    setIsCartOpen(true)
  }, [applyShopifyOperation, mode, shopifyCart?.id, status])

  const removeItem = useCallback(async (id: string) => {
    if (mode === 'preview') {
      setItems((previous) => previous.filter((item) => item.id !== id))
      return
    }
    const cartId = shopifyCart?.id
    if (!cartId) return
    await applyShopifyOperation({ action: 'remove', cartId, lineId: id })
  }, [applyShopifyOperation, mode, shopifyCart?.id])

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return
    if (mode === 'preview') {
      setItems((previous) => previous.map((item) => item.id === id ? { ...item, quantity } : item))
      return
    }
    const cartId = shopifyCart?.id
    if (!cartId) return
    await applyShopifyOperation({ action: 'update', cartId, lineId: id, quantity })
  }, [applyShopifyOperation, mode, shopifyCart?.id])

  const checkout = useCallback(async () => {
    if (mode === 'preview') {
      openCheckout()
      return
    }
    if (status !== 'ready' || isCartMutating || items.length === 0) return

    const cartId = shopifyCart?.id ?? getStoredShopifyCartId()
    if (!cartId) {
      setCartError('Your Shopify bag is empty. Add an item before checkout.')
      return
    }

    const cart = await applyShopifyOperation({ action: 'checkout', cartId })
    if (!cart?.checkoutUrl) {
      setCartError('Shopify did not provide a secure checkout link. Please try again.')
      return
    }

    try {
      const checkoutUrl = new URL(cart.checkoutUrl)
      if (checkoutUrl.protocol !== 'https:') throw new Error('Insecure checkout URL')
      window.location.assign(checkoutUrl.href)
    } catch {
      setCartError('Shopify returned an invalid checkout link. Please try again.')
    }
  }, [applyShopifyOperation, isCartMutating, items.length, mode, openCheckout, shopifyCart?.id, status])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotalAmount = mode === 'live' && shopifyCart
    ? shopifyCart.subtotal.amount
    : items.reduce((sum, item) => sum + Number(item.unitPrice.amount) * item.quantity, 0).toFixed(2)
  const subtotalCurrencyCode = mode === 'live' && shopifyCart
    ? shopifyCart.subtotal.currencyCode
    : items[0]?.unitPrice.currencyCode ?? 'INR'
  const subtotalFormatted = formatMoney(subtotalAmount, subtotalCurrencyCode)

  const contextValue = useMemo<CartContextType>(() => ({
    mode,
    status,
    products,
    featuredProducts,
    homepageContent,
    homepageStatus,
    items,
    isCartOpen,
    isCheckoutOpen,
    isCartMutating,
    cartError,
    totalItems,
    subtotalAmount,
    subtotalCurrencyCode,
    subtotalFormatted,
    openCart,
    closeCart,
    openCheckout,
    closeCheckout,
    addItem,
    removeItem,
    updateQuantity,
    checkout,
  }), [
    mode,
    status,
    products,
    featuredProducts,
    homepageContent,
    homepageStatus,
    items,
    isCartOpen,
    isCheckoutOpen,
    isCartMutating,
    cartError,
    totalItems,
    subtotalAmount,
    subtotalCurrencyCode,
    subtotalFormatted,
    openCart,
    closeCart,
    openCheckout,
    closeCheckout,
    addItem,
    removeItem,
    updateQuantity,
    checkout,
  ])

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}
