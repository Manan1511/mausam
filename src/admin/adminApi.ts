import type { HomepageContent } from '../types/shopify'
import { validateHomepageContent } from '../services/homepageContentValidation'
import type {
  AdminMediaChoice,
  AdminPageInfo,
  AdminProductChoice,
  AdminSessionResponse,
} from './adminTypes'

export class AdminApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json')

  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers,
      credentials: 'same-origin',
      cache: 'no-store',
    })
  } catch {
    throw new AdminApiError('The admin service could not be reached. Please try again.', 0)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new AdminApiError('The admin service returned an invalid response.', response.status)
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload &&
      typeof payload.error === 'string'
      ? payload.error
      : 'The admin request could not be completed.'
    throw new AdminApiError(message, response.status)
  }
  return payload as T
}

function validShopifyAuthorizationUrl(value: unknown): string {
  if (typeof value !== 'string') throw new AdminApiError('Shopify returned an invalid sign-in link.', 502)
  try {
    const url = new URL(value)
    if (
      url.protocol === 'https:' && !url.username && !url.password &&
      /^[a-z0-9-]+\.myshopify\.com$/i.test(url.hostname) &&
      url.pathname === '/admin/oauth/authorize'
    ) return url.href
  } catch {
    // Rejected below.
  }
  throw new AdminApiError('Shopify returned an invalid sign-in link.', 502)
}

export const adminApi = {
  getSession: () => request<AdminSessionResponse>('/api/admin/session'),

  async startSignIn(): Promise<string> {
    const result = await request<{ authorizationUrl: unknown }>('/api/admin/auth/start', { method: 'POST' })
    return validShopifyAuthorizationUrl(result.authorizationUrl)
  },

  async getContent(): Promise<{ content: HomepageContent | null; exists: boolean }> {
    const result = await request<{ content: unknown; exists: unknown }>('/api/admin/content')
    if (typeof result.exists !== 'boolean') throw new AdminApiError('The homepage response was invalid.', 502)
    try {
      return { content: validateHomepageContent(result.content), exists: result.exists }
    } catch {
      throw new AdminApiError('The saved homepage content is invalid. Review the Shopify metaobject setup.', 502)
    }
  },

  async saveContent(content: HomepageContent): Promise<HomepageContent> {
    const result = await request<{ content: unknown }>('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify(content),
    })
    try {
      const saved = validateHomepageContent(result.content)
      if (!saved) throw new TypeError('Missing saved content')
      return saved
    } catch {
      throw new AdminApiError('Shopify saved an unreadable homepage record. Reload before continuing.', 502)
    }
  },

  getProducts(after?: string | null) {
    const query = after ? `?after=${encodeURIComponent(after)}` : ''
    return request<{ products: AdminProductChoice[]; pageInfo: AdminPageInfo }>(`/api/admin/products${query}`)
  },

  getFiles(after?: string | null) {
    const query = after ? `?after=${encodeURIComponent(after)}` : ''
    return request<{ files: AdminMediaChoice[]; pageInfo: AdminPageInfo }>(`/api/admin/files${query}`)
  },

  uploadFile(file: File, altText: string) {
    const body = new FormData()
    body.set('file', file)
    body.set('altText', altText)
    return request<{ file: AdminMediaChoice }>('/api/admin/files', { method: 'POST', body })
  },

  logout: () => request<{ authenticated: false }>('/api/admin/logout', { method: 'POST' }),
}
