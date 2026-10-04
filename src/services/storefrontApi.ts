import type {
  CartOperation,
  HomepageContent,
  StoreProduct,
  StorefrontCart,
  StorefrontStatus,
} from '../types/shopify'

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

export const storefrontApi: StorefrontApi = {
  getStatus: () => request<StorefrontStatus>('/api/storefront/status'),
  getCatalog: async () => {
    const result = await request<{ products: StoreProduct[] }>('/api/storefront/catalog')
    return result.products
  },
  getHomepageContent: async () => {
    const result = await request<{ content: HomepageContent | null }>('/api/storefront/homepage')
    return result.content
  },
  mutateCart: (operation) =>
    request<StorefrontCart>('/api/storefront/cart', {
      method: 'POST',
      body: JSON.stringify(operation),
    }),
}
