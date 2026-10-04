import { createHmac, timingSafeEqual } from 'node:crypto'
import { jsonResponse } from './_shared/http.js'
import {
  clearAdminSessionCookie,
  clearOAuthStateCookie,
  createAdminSession,
  getOAuthStateCookie,
} from './_shared/adminSession.js'
import { containsControlCharacters } from './_shared/adminHttp.js'
import { getShopifyRuntimeConfig, REQUIRED_ADMIN_SCOPES } from './_shared/shopifyEnv.js'

const MAX_TOKEN_RESPONSE_BYTES = 65_536
const MAX_OAUTH_TOKEN_LIFETIME_SECONDS = 86_400

interface ShopifyOnlineTokenResponse {
  access_token?: unknown
  scope?: unknown
  expires_in?: unknown
  associated_user?: {
    id?: unknown
    email?: unknown
    email_verified?: unknown
  }
  associated_user_scope?: unknown
}

function callbackHmacIsValid(params: URLSearchParams, secret: string): boolean {
  const signatures = params.getAll('hmac')
  if (signatures.length !== 1 || !/^[a-f0-9]{64}$/i.test(signatures[0])) return false

  const entries = Array.from(params.entries())
  if (entries.some(([key]) => params.getAll(key).length !== 1)) return false
  const message = entries
    .filter(([key]) => key !== 'hmac')
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  const expected = createHmac('sha256', secret).update(message).digest()
  const received = Buffer.from(signatures[0], 'hex')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

function validTimestamp(value: string | null): boolean {
  if (!value || !/^\d{1,12}$/.test(value)) return false
  const timestamp = Number(value) * 1000
  return Number.isSafeInteger(timestamp) && Math.abs(Date.now() - timestamp) <= 10 * 60 * 1000
}

function constantTimeTextEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left)
  const rightBytes = Buffer.from(right)
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
}

function normalizeScopeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string')
  }
  if (typeof value === 'string') return value.split(',').map((scope) => scope.trim()).filter(Boolean)
  return []
}

function isScopeList(value: unknown): boolean {
  return typeof value === 'string' ||
    (Array.isArray(value) && value.every((entry) => typeof entry === 'string'))
}

async function readTokenResponse(response: Response): Promise<ShopifyOnlineTokenResponse | null> {
  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_TOKEN_RESPONSE_BYTES) {
    await response.body?.cancel()
    return null
  }
  if (!response.body) return null

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_TOKEN_RESPONSE_BYTES) {
        await reader.cancel()
        return null
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
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return typeof payload === 'object' && payload !== null && !Array.isArray(payload)
      ? payload as ShopifyOnlineTokenResponse
      : null
  } catch {
    return null
  }
}

function failureResponse(configuredOrigin: string | null, status = 400): Response {
  const headers = new Headers({ 'set-cookie': clearOAuthStateCookie(), 'cache-control': 'no-store' })
  if (configuredOrigin) {
    headers.set('location', `${configuredOrigin}/admin?auth=error`)
    return new Response(null, { status: 303, headers })
  }
  headers.append('set-cookie', clearAdminSessionCookie())
  return jsonResponse({ error: 'Shopify sign-in could not be completed.' }, status, headers)
}

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return new Response('Method not allowed.', { status: 405, headers: { allow: 'GET' } })
    const config = getShopifyRuntimeConfig()
    if (!config.adminConfigured || !config.shopDomain || !config.apiKey || !config.apiSecret || !config.appOrigin) {
      return failureResponse(config.appOrigin, 503)
    }

    const callbackUrl = new URL(request.url)
    if (callbackUrl.origin !== config.appOrigin) return failureResponse(config.appOrigin, 403)
    const params = callbackUrl.searchParams
    const state = params.get('state')
    const stateCookie = getOAuthStateCookie(request)
    if (
      callbackUrl.href.length > 8192 ||
      params.size > 20 ||
      !state ||
      !stateCookie ||
      !constantTimeTextEqual(state, stateCookie) ||
      !callbackHmacIsValid(params, config.apiSecret) ||
      !validTimestamp(params.get('timestamp')) ||
      params.get('shop') !== config.shopDomain
    ) {
      return failureResponse(config.appOrigin)
    }

    const code = params.get('code')
    if (!code || code.length > 2048 || containsControlCharacters(code)) {
      return failureResponse(config.appOrigin)
    }

    try {
      const body = new URLSearchParams({
        client_id: config.apiKey,
        client_secret: config.apiSecret,
        code,
      })
      const response = await fetch(`https://${config.shopDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
        body,
        redirect: 'error',
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        await response.body?.cancel()
        return failureResponse(config.appOrigin, 502)
      }

      const tokenResponse = await readTokenResponse(response)
      if (!tokenResponse) return failureResponse(config.appOrigin, 502)

      const user = tokenResponse.associated_user
      const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : ''
      const userId = typeof user?.id === 'string' || typeof user?.id === 'number' ? String(user.id) : ''
      const token = typeof tokenResponse.access_token === 'string' ? tokenResponse.access_token : ''
      const grantedScopes = new Set(normalizeScopeList(tokenResponse.scope))
      const userScopes = normalizeScopeList(tokenResponse.associated_user_scope)
      const lifetime = Number(tokenResponse.expires_in)
      const allowedEmails = new Set(config.adminEmailAllowlist)
      if (
        !token || token.length > 4096 || /\s/.test(token) ||
        !isScopeList(tokenResponse.scope) ||
        !isScopeList(tokenResponse.associated_user_scope) ||
        !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        user?.email_verified !== true ||
        !userId || userId.length > 64 ||
        !allowedEmails.has(email) ||
        !Number.isFinite(lifetime) || lifetime <= 0 ||
        !REQUIRED_ADMIN_SCOPES.every((scope) => grantedScopes.has(scope))
      ) {
        return failureResponse(config.appOrigin, 403)
      }

      const session = await createAdminSession({
        shopDomain: config.shopDomain,
        token,
        email,
        emailVerified: true,
        userId,
        userScopes,
        expiresAt: Date.now() + Math.min(lifetime, MAX_OAUTH_TOKEN_LIFETIME_SECONDS) * 1000,
      })
      const headers = new Headers({
        location: `${config.appOrigin}/admin`,
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      })
      headers.append('set-cookie', session.cookie)
      headers.append('set-cookie', clearOAuthStateCookie())
      return new Response(null, { status: 303, headers })
    } catch {
      return failureResponse(config.appOrigin, 502)
    }
  },
}
