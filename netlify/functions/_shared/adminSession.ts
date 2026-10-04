import { getStore } from '@netlify/blobs'
import { randomBytes } from 'node:crypto'
import { isRecord } from './adminHttp.js'
import { jsonResponse } from './http.js'
import { ShopifyApiError, shopifyAdminGraphql } from './shopifyGraphql.js'
import { getShopifyRuntimeConfig, REQUIRED_ADMIN_SCOPES } from './shopifyEnv.js'

const SESSION_COOKIE = '__Host-mausam_admin'
const OAUTH_STATE_COOKIE = '__Host-mausam_oauth_state'
const SESSION_MAX_AGE_SECONDS = 86_400

export interface AdminSession {
  sessionId: string
  shopDomain: string
  token: string
  email: string
  emailVerified: true
  userId: string
  userScopes: string[]
  expiresAt: number
}

interface StoredAdminSession extends Omit<AdminSession, 'sessionId'> {
  createdAt: number
}

function sessionStore() {
  return getStore({ name: 'mausam-admin-sessions', consistency: 'strong' })
}

function opaqueRandomValue(): string {
  return randomBytes(32).toString('base64url')
}

export function createOAuthState(): string {
  return opaqueRandomValue()
}

export function oauthStateCookie(value: string): string {
  return `${OAUTH_STATE_COOKIE}=${value}; Path=/; Max-Age=600; Secure; HttpOnly; SameSite=Lax`
}

export function clearOAuthStateCookie(): string {
  return `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`
}

export function clearAdminSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`
}

function cookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=')
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue
    return cookie.slice(separator + 1).trim() || null
  }
  return null
}

export function getOAuthStateCookie(request: Request): string | null {
  const value = cookieValue(request, OAUTH_STATE_COOKIE)
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null
}

export function getAdminSessionId(request: Request): string | null {
  const value = cookieValue(request, SESSION_COOKIE)
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null
}

export function requireSameOrigin(request: Request): Response | null {
  const config = getShopifyRuntimeConfig()
  const origin = request.headers.get('origin')
  let requestOrigin: string
  try {
    requestOrigin = new URL(request.url).origin
  } catch {
    return jsonResponse({ error: 'Invalid request origin.' }, 403)
  }

  if (!config.appOrigin || !origin || origin === 'null' || origin !== config.appOrigin || origin !== requestOrigin) {
    return jsonResponse({ error: 'Cross-origin request rejected.' }, 403)
  }
  return null
}

export async function createAdminSession(
  values: Omit<AdminSession, 'sessionId'>,
): Promise<{ sessionId: string; cookie: string }> {
  const now = Date.now()
  const expiresAt = Math.min(values.expiresAt, now + SESSION_MAX_AGE_SECONDS * 1000)
  const stored: StoredAdminSession = {
    ...values,
    expiresAt,
    createdAt: now,
  }

  let sessionId = ''
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const candidate = opaqueRandomValue()
    const result = await sessionStore().setJSON(`session:${candidate}`, stored, { onlyIfNew: true })
    if (result.modified) {
      sessionId = candidate
      break
    }
  }
  if (!sessionId) throw new Error('Could not allocate an admin session.')
  const maxAge = Math.max(0, Math.floor((expiresAt - now) / 1000))
  return {
    sessionId,
    cookie: `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`,
  }
}

export async function deleteAdminSession(sessionId: string): Promise<void> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(sessionId)) return
  await sessionStore().delete(`session:${sessionId}`)
}

function hasRequiredShopifyScopes(scopes: Set<string>): boolean {
  return REQUIRED_ADMIN_SCOPES.every((scope) => scopes.has(scope))
}

export async function requireAdminSession(request: Request): Promise<AdminSession | Response> {
  const config = getShopifyRuntimeConfig()
  const sessionId = getAdminSessionId(request)

  if (!sessionId || !config.adminConfigured || !config.shopDomain) {
    if (sessionId) await deleteAdminSession(sessionId)
    return jsonResponse({ error: 'Admin sign-in is required.' }, 401, {
      'set-cookie': clearAdminSessionCookie(),
    })
  }

  try {
    const storedValue: unknown = await sessionStore().get(`session:${sessionId}`, { type: 'json' })
    const stored = isRecord(storedValue) ? storedValue as unknown as StoredAdminSession : null
    const now = Date.now()
    const allowedEmails = new Set(config.adminEmailAllowlist)
    if (
      !stored ||
      typeof stored.expiresAt !== 'number' ||
      !Number.isSafeInteger(stored.expiresAt) ||
      stored.expiresAt <= now ||
      typeof stored.shopDomain !== 'string' ||
      stored.shopDomain !== config.shopDomain ||
      stored.emailVerified !== true ||
      typeof stored.email !== 'string' ||
      !allowedEmails.has(stored.email) ||
      typeof stored.token !== 'string' ||
      !stored.token ||
      /\s/.test(stored.token) ||
      typeof stored.userId !== 'string' ||
      !Array.isArray(stored.userScopes) ||
      !stored.userScopes.every((scope) => typeof scope === 'string')
    ) {
      await deleteAdminSession(sessionId)
      return jsonResponse({ error: 'Admin sign-in is required.' }, 401, {
        'set-cookie': clearAdminSessionCookie(),
      })
    }

    const validation = await shopifyAdminGraphql<{
      currentAppInstallation: { accessScopes: Array<{ handle: string }> } | null
    }>(stored.token, `
      query ValidateAdminSession {
        currentAppInstallation { accessScopes { handle } }
      }
    `)
    const grantedScopes = new Set(
      validation.currentAppInstallation?.accessScopes
        ?.map(({ handle }) => handle)
        .filter((handle) => typeof handle === 'string') ?? [],
    )

    if (!validation.currentAppInstallation || !hasRequiredShopifyScopes(grantedScopes)) {
      await deleteAdminSession(sessionId)
      return jsonResponse({ error: 'Shopify access is no longer available. Sign in again.' }, 401, {
        'set-cookie': clearAdminSessionCookie(),
      })
    }

    return { ...stored, sessionId }
  } catch (error) {
    if (error instanceof ShopifyApiError && error.status === 401) {
      await deleteAdminSession(sessionId)
      return jsonResponse({ error: 'Shopify access is no longer available. Sign in again.' }, 401, {
        'set-cookie': clearAdminSessionCookie(),
      })
    }
    return jsonResponse({ error: 'Admin authorization could not be verified.' }, 503)
  }
}

export function hasStaffScope(session: AdminSession, scope: string): boolean {
  if (session.userScopes.includes(scope)) return true
  if (scope.startsWith('read_')) return session.userScopes.includes(`write_${scope.slice(5)}`)
  return false
}
