export const DEFAULT_SHOPIFY_API_VERSION = '2026-07'
export const REQUIRED_ADMIN_SCOPES = ['read_products', 'write_metaobjects', 'write_files'] as const

export interface ShopifyRuntimeConfig {
  mode: 'preview' | 'live'
  adminConfigured: boolean
  apiVersion: string
  appOrigin: string | null
  shopDomain: string | null
  apiKey: string | null
  apiSecret: string | null
  adminEmailAllowlist: string[]
  adminScopes: string[]
  storefrontPrivateToken: string | null
  checkoutAllowedHosts: string[]
}

function readEnv(name: string): string | undefined {
  const runtime = globalThis as typeof globalThis & {
    Netlify?: { env: { get: (key: string) => string | undefined } }
  }
  const netlifyValue = runtime.Netlify?.env.get(name)
  return netlifyValue ?? process.env[name]
}

function parseShopDomain(value: string | undefined): string | null {
  const domain = value?.trim().toLowerCase()
  if (!domain || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.myshopify\.com$/.test(domain)) {
    return null
  }

  return domain
}

function parseAppOrigin(value: string | undefined): string | null {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      return null
    }
    return url.origin
  } catch {
    return null
  }
}

function parseList(value: string | undefined): string[] {
  return Array.from(new Set((value ?? '')
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)))
}

function parseApiVersion(value: string | undefined): string {
  const candidate = value?.trim()
  return candidate && /^\d{4}-\d{2}$/.test(candidate)
    ? candidate
    : DEFAULT_SHOPIFY_API_VERSION
}

export function getShopifyRuntimeConfig(): ShopifyRuntimeConfig {
  const shopDomain = parseShopDomain(readEnv('SHOPIFY_SHOP_DOMAIN'))
  const appOrigin = parseAppOrigin(readEnv('SHOPIFY_APP_URL'))
  const apiKey = readEnv('SHOPIFY_API_KEY')?.trim() || null
  const apiSecret = readEnv('SHOPIFY_API_SECRET')?.trim() || null
  const adminEmailAllowlist = parseList(readEnv('SHOPIFY_ADMIN_EMAIL_ALLOWLIST'))
    .map((email) => email.toLowerCase())
  const adminScopes = parseList(readEnv('SHOPIFY_ADMIN_SCOPES'))
  const storefrontPrivateToken = readEnv('SHOPIFY_STOREFRONT_PRIVATE_TOKEN')?.trim() || null
  const checkoutAllowedHosts = [shopDomain, ...parseList(readEnv('SHOPIFY_CHECKOUT_ALLOWED_HOSTS'))]
    .filter((host): host is string => Boolean(host))
    .map((host) => host.trim().toLowerCase())
    .filter((host) => /^[a-z0-9.-]+$/.test(host))
  const liveConfigurationComplete = Boolean(
    shopDomain && apiKey && apiSecret && adminEmailAllowlist.length && storefrontPrivateToken,
  )
  const adminConfigured = Boolean(
    shopDomain &&
      appOrigin &&
      apiKey &&
      apiSecret &&
      adminEmailAllowlist.length &&
      REQUIRED_ADMIN_SCOPES.every((scope) => adminScopes.includes(scope)) &&
      adminScopes.every((scope) => REQUIRED_ADMIN_SCOPES.includes(scope as typeof REQUIRED_ADMIN_SCOPES[number])),
  )

  return {
    mode:
      readEnv('SHOPIFY_MODE')?.trim().toLowerCase() === 'live' && liveConfigurationComplete
        ? 'live'
        : 'preview',
    adminConfigured,
    apiVersion: parseApiVersion(readEnv('SHOPIFY_API_VERSION')),
    appOrigin,
    shopDomain,
    apiKey,
    apiSecret,
    adminEmailAllowlist,
    adminScopes,
    storefrontPrivateToken,
    checkoutAllowedHosts,
  }
}
