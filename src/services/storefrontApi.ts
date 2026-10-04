import type {
  CartOperation,
  HomepageContent,
  StoreProduct,
  StorefrontCart,
  StorefrontStatus,
} from '../types/shopify'
import { validateHomepageContent } from './homepageContentValidation'

export class StorefrontApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'StorefrontApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('accept', 'application/json')
  if (init?.body) headers.set('content-type', 'application/json')

  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers,
    })
  } catch {
    throw new StorefrontApiError('The storefront service is unavailable.', 0)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new StorefrontApiError('The storefront service returned an invalid response.', response.status)
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'The storefront request could not be completed.'
    throw new StorefrontApiError(message, response.status)
  }

  return payload as T
}

export interface StorefrontApi {
  getStatus(): Promise<StorefrontStatus>
  getCatalog(): Promise<StoreProduct[]>
  getHomepageContent(): Promise<HomepageContent | null>
  mutateCart(operation: CartOperation): Promise<StorefrontCart>
}

export const storefrontBuildMode: 'preview' | 'live' =
  import.meta.env.VITE_SHOPIFY_MODE === 'live' ? 'live' : 'preview'

export const storefrontApi: StorefrontApi = {
  getStatus: () => request<StorefrontStatus>('/api/storefront/status'),
  getCatalog: async () => {
    const products: StoreProduct[] = []
    let after: string | null = null
    let page = 0
    let hasNextPage: boolean

    do {
      const search: string = after !== null ? `?after=${encodeURIComponent(after)}` : ''
      const result: {
        products: StoreProduct[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      } = await request<{
        products: StoreProduct[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }>(`/api/storefront/catalog${search}`)
      products.push(...result.products)
      after = result.pageInfo.endCursor
      hasNextPage = result.pageInfo.hasNextPage
      page += 1

      if (hasNextPage && !after) {
        throw new StorefrontApiError('The catalog could not be fully loaded.', 502)
      }
      if (hasNextPage && page >= 10) {
        throw new StorefrontApiError('The catalog exceeds the supported size.', 413)
      }
    } while (hasNextPage)

    return products
  },
  getHomepageContent: async () => {
    const result = await request<{ content: unknown }>('/api/storefront/homepage')
    try {
      return validateHomepageContent(result.content)
    } catch {
      throw new StorefrontApiError('The storefront service returned invalid homepage content.', 502)
    }
  },
  mutateCart: async (operation) => {
    const result = await request<{ cart: StorefrontCart }>('/api/storefront/cart', {
      method: 'POST',
      body: JSON.stringify(operation),
    })
    return result.cart
  },
}
