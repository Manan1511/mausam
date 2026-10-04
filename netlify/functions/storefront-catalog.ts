import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'
import { shopifyStorefrontGraphql } from './_shared/shopifyGraphql.js'
import { previewProducts } from '../../src/services/previewCatalog.js'
import type { StoreProduct, StoreProductCategory } from '../../src/types/shopify.js'

const PAGE_SIZE = 20

interface ShopifyMoney {
  amount: string
  currencyCode: string
}

interface ShopifyProductNode {
  id: string
  handle: string
  title: string
  description: string
  vendor: string
  productType: string
  availableForSale: boolean
  featuredImage: { url: string; altText: string | null } | null
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney }
  variants: {
    nodes: Array<{
      id: string
      title: string
      sku: string | null
      availableForSale: boolean
      price: ShopifyMoney
      selectedOptions: Array<{ name: string; value: string }>
    }>
  }
}

interface CatalogResponse {
  products: {
    nodes: ShopifyProductNode[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

const CATALOG_QUERY = `
  query StorefrontCatalog($after: String) {
    products(first: ${PAGE_SIZE}, after: $after) {
      nodes {
        id
        handle
        title
        description
        vendor
        productType
        availableForSale
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
        variants(first: 20) {
          nodes {
            id
            title
            sku
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

function normalizeCategory(productType: string): StoreProductCategory | null {
  const value = productType.trim().toLowerCase()
  if (value.includes('candle')) return 'candles'
  if (value.includes('bouquet') || value.includes('flower') || value.includes('floral')) {
    return 'bouquets'
  }
  return null
}

function safeShopifyImage(image: ShopifyProductNode['featuredImage']) {
  if (!image) return null
  try {
    const url = new URL(image.url)
    const isShopifyCdn =
      url.protocol === 'https:' &&
      (url.hostname === 'cdn.shopify.com' ||
        url.hostname.endsWith('.shopify.com') ||
        url.hostname.endsWith('.shopifycdn.net'))
    return isShopifyCdn ? { url: url.href, altText: image.altText } : null
  } catch {
    return null
  }
}

function normalizeProduct(product: ShopifyProductNode): StoreProduct {
  const variants = product.variants.nodes.map((variant) => ({
    id: variant.id,
    title: variant.title,
    sku: variant.sku,
    availableForSale: variant.availableForSale,
    price: variant.price,
    selectedOptions: variant.selectedOptions,
  }))

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    category: normalizeCategory(product.productType),
    subtitle: product.productType || product.vendor,
    badge: null,
    description: product.description,
    vendor: product.vendor,
    availableForSale: product.availableForSale && variants.some((variant) => variant.availableForSale),
    image: safeShopifyImage(product.featuredImage),
    priceRange: {
      min: product.priceRange.minVariantPrice,
      max: product.priceRange.maxVariantPrice,
    },
    variants,
    specs: {},
  }
}

function isAfterCursor(value: string | null): value is string {
  return Boolean(
    value && value.length <= 512 &&
    !Array.from(value).some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    }),
  )
}

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    const config = getShopifyRuntimeConfig()
    if (config.mode !== 'live') {
      return jsonResponse({ products: previewProducts, pageInfo: { hasNextPage: false, endCursor: null } })
    }

    const after = new URL(request.url).searchParams.get('after')
    if (after !== null && !isAfterCursor(after)) {
      return jsonResponse({ error: 'Invalid catalog cursor.' }, 400)
    }

    try {
      const result = await shopifyStorefrontGraphql<CatalogResponse>(
        CATALOG_QUERY,
        { after },
      )
      return jsonResponse({
        products: result.products.nodes.map(normalizeProduct),
        pageInfo: result.products.pageInfo,
      })
    } catch {
      return jsonResponse({ error: 'The Shopify catalog is temporarily unavailable.' }, 503)
    }
  },
}
