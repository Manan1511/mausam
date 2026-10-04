import { getShopifyRuntimeConfig } from './shopifyEnv.js'

const REQUEST_TIMEOUT_MS = 10_000
const MAX_RESPONSE_BYTES = 1_048_576

type GraphqlPayload<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

export class ShopifyApiError extends Error {
  readonly code: 'NOT_CONFIGURED' | 'UPSTREAM_HTTP' | 'UPSTREAM_RESPONSE' | 'GRAPHQL'
  readonly status: number | undefined

  constructor(
    message: string,
    code: 'NOT_CONFIGURED' | 'UPSTREAM_HTTP' | 'UPSTREAM_RESPONSE' | 'GRAPHQL',
    status?: number,
  ) {
    super(message)
    this.name = 'ShopifyApiError'
    this.code = code
    this.status = status
  }
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    await response.body?.cancel()
    throw new ShopifyApiError('Shopify response exceeded the allowed size.', 'UPSTREAM_RESPONSE')
  }

  if (!response.body) {
    throw new ShopifyApiError('Shopify returned an empty response.', 'UPSTREAM_RESPONSE')
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength

      if (totalBytes > MAX_RESPONSE_BYTES) {
        await reader.cancel()
        throw new ShopifyApiError('Shopify response exceeded the allowed size.', 'UPSTREAM_RESPONSE')
      }

      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown
  } catch {
    throw new ShopifyApiError('Shopify returned invalid JSON.', 'UPSTREAM_RESPONSE')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function requestShopifyGraphql<T>(
  endpoint: string,
  tokenHeader: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
  buyerIp?: string,
): Promise<T> {
  const headers = new Headers({
    'content-type': 'application/json',
    [tokenHeader]: token,
  })
  if (buyerIp) headers.set('Shopify-Storefront-Buyer-IP', buyerIp)

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ShopifyApiError('Shopify could not be reached.', 'UPSTREAM_HTTP')
  }

  if (!response.ok) {
    await response.body?.cancel()
    throw new ShopifyApiError('Shopify rejected the API request.', 'UPSTREAM_HTTP', response.status)
  }

  const payload = await readBoundedJson(response)
  if (!isRecord(payload)) {
    throw new ShopifyApiError('Shopify returned an invalid GraphQL response.', 'UPSTREAM_RESPONSE')
  }

  const result = payload as GraphqlPayload<T>
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    throw new ShopifyApiError('Shopify could not complete the GraphQL request.', 'GRAPHQL')
  }
  if (!('data' in result)) {
    throw new ShopifyApiError('Shopify returned no GraphQL data.', 'UPSTREAM_RESPONSE')
  }

  return result.data as T
}

export async function shopifyAdminGraphql<T>(
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const config = getShopifyRuntimeConfig()
  if (!config.shopDomain || !token.trim()) {
    throw new ShopifyApiError('Shopify Admin API is not configured.', 'NOT_CONFIGURED')
  }

  const endpoint = `https://${config.shopDomain}/admin/api/${config.apiVersion}/graphql.json`
  return requestShopifyGraphql<T>(endpoint, 'X-Shopify-Access-Token', token.trim(), query, variables)
}

export async function shopifyStorefrontGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  buyerIp?: string,
): Promise<T> {
  const config = getShopifyRuntimeConfig()
  if (config.mode !== 'live' || !config.shopDomain || !config.storefrontPrivateToken) {
    throw new ShopifyApiError('Shopify Storefront API is not configured.', 'NOT_CONFIGURED')
  }

  const endpoint = `https://${config.shopDomain}/api/${config.apiVersion}/graphql.json`
  return requestShopifyGraphql<T>(
    endpoint,
    'Shopify-Storefront-Private-Token',
    config.storefrontPrivateToken,
    query,
    variables,
    buyerIp,
  )
}
