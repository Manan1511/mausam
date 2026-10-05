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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0
    return code <= 31 || code === 127
  })
}

function isShopifyMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.shopify.com') || url.hostname.endsWith('.shopifycdn.net'))
  } catch {
    return false
  }
}

function parsePageInfo(value: unknown): AdminPageInfo {
  if (!isRecord(value) || typeof value.hasNextPage !== 'boolean' ||
    !(value.endCursor === null || (typeof value.endCursor === 'string' && value.endCursor.length <= 512 && !hasControlCharacters(value.endCursor))) ||
    (value.hasNextPage && (typeof value.endCursor !== 'string' || !value.endCursor))) {
    throw new AdminApiError('Shopify returned invalid pagination data.', 502)
  }
  return { hasNextPage: value.hasNextPage, endCursor: value.endCursor }
}

function parseImageChoice(value: unknown): AdminProductChoice['image'] {
  if (value === null) return null
  if (!isRecord(value) || !isShopifyMediaUrl(value.url) ||
    !(value.altText === null || typeof value.altText === 'string')) {
    throw new AdminApiError('Shopify returned an invalid product image.', 502)
  }
  return { url: value.url, altText: value.altText }
}

function parseProductChoice(value: unknown): AdminProductChoice {
  if (!isRecord(value) || typeof value.id !== 'string' ||
    !/^gid:\/\/shopify\/Product\/[A-Za-z0-9-]+$/.test(value.id) ||
    typeof value.handle !== 'string' || !value.handle.trim() ||
    typeof value.title !== 'string' || !value.title.trim()) {
    throw new AdminApiError('Shopify returned an invalid product.', 502)
  }
  return {
    id: value.id,
    handle: value.handle,
    title: value.title,
    image: parseImageChoice(value.image),
  }
}

function parseMediaChoice(value: unknown): AdminMediaChoice {
  if (!isRecord(value) || typeof value.id !== 'string' ||
    !/^gid:\/\/shopify\/MediaImage\/[A-Za-z0-9-]+$/.test(value.id) ||
    !(value.altText === null || typeof value.altText === 'string') ||
    !(value.url === null || isShopifyMediaUrl(value.url)) ||
    typeof value.fileStatus !== 'string' || !value.fileStatus.trim()) {
    throw new AdminApiError('Shopify returned an invalid media file.', 502)
  }
  return {
    id: value.id,
    altText: value.altText,
    url: value.url,
    fileStatus: value.fileStatus,
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
  async getSession(): Promise<AdminSessionResponse> {
    const result = await request<unknown>('/api/admin/session')
    if (!isRecord(result) || typeof result.authenticated !== 'boolean' || typeof result.configured !== 'boolean' ||
      (result.email !== undefined && (typeof result.email !== 'string' || result.email.length > 320 || hasControlCharacters(result.email))) ||
      (result.authenticated && (!result.configured || typeof result.email !== 'string' || !result.email.trim()))) {
      throw new AdminApiError('The admin session response was invalid.', 502)
    }
    return {
      authenticated: result.authenticated,
      configured: result.configured,
      ...(typeof result.email === 'string' ? { email: result.email } : {}),
    }
  },

  async startSignIn(): Promise<string> {
    const result = await request<unknown>('/api/admin/auth/start', { method: 'POST' })
    return validShopifyAuthorizationUrl(isRecord(result) ? result.authorizationUrl : undefined)
  },

  async getContent(): Promise<{ content: HomepageContent | null; exists: boolean }> {
    const result = await request<unknown>('/api/admin/content')
    if (!isRecord(result)) throw new AdminApiError('The homepage response was invalid.', 502)
    if (typeof result.exists !== 'boolean') throw new AdminApiError('The homepage response was invalid.', 502)
    try {
      return { content: validateHomepageContent(result.content), exists: result.exists }
    } catch {
      throw new AdminApiError('The saved homepage content is invalid. Review the Shopify metaobject setup.', 502)
    }
  },

  async saveContent(content: HomepageContent): Promise<HomepageContent> {
    const result = await request<unknown>('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify(content),
    })
    try {
      const saved = validateHomepageContent(isRecord(result) ? result.content : undefined)
      if (!saved) throw new TypeError('Missing saved content')
      return saved
    } catch {
      throw new AdminApiError('Shopify saved an unreadable homepage record. Reload before continuing.', 502)
    }
  },

  async getProducts(after?: string | null): Promise<{ products: AdminProductChoice[]; pageInfo: AdminPageInfo }> {
    const query = after ? `?after=${encodeURIComponent(after)}` : ''
    const result = await request<unknown>(`/api/admin/products${query}`)
    if (!isRecord(result) || !Array.isArray(result.products) || result.products.length > 100) {
      throw new AdminApiError('Shopify returned an invalid product list.', 502)
    }
    return { products: result.products.map(parseProductChoice), pageInfo: parsePageInfo(result.pageInfo) }
  },

  async getFiles(after?: string | null): Promise<{ files: AdminMediaChoice[]; pageInfo: AdminPageInfo }> {
    const query = after ? `?after=${encodeURIComponent(after)}` : ''
    const result = await request<unknown>(`/api/admin/files${query}`)
    if (!isRecord(result) || !Array.isArray(result.files) || result.files.length > 100) {
      throw new AdminApiError('Shopify returned an invalid media list.', 502)
    }
    return { files: result.files.map(parseMediaChoice), pageInfo: parsePageInfo(result.pageInfo) }
  },

  async uploadFile(file: File, altText: string): Promise<{ file: AdminMediaChoice }> {
    const body = new FormData()
    body.set('file', file)
    body.set('altText', altText)
    const result = await request<unknown>('/api/admin/files', { method: 'POST', body })
    if (!isRecord(result)) throw new AdminApiError('Shopify returned an invalid media upload.', 502)
    return { file: parseMediaChoice(result.file) }
  },

  async logout(): Promise<{ authenticated: false }> {
    const result = await request<unknown>('/api/admin/logout', { method: 'POST' })
    if (!isRecord(result) || result.authenticated !== false) {
      throw new AdminApiError('The sign-out response was invalid.', 502)
    }
    return { authenticated: false }
  },
}
