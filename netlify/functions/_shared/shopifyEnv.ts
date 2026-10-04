export const DEFAULT_SHOPIFY_API_VERSION = '2026-10'

export interface ShopifyRuntimeConfig {
  mode: 'preview' | 'live'
  apiVersion: string
  shopDomain: string | null
  apiKey: string | null
  apiSecret: string | null
  adminEmailAllowlist: string[]
  adminScopes: string[]
  storefrontPrivateToken: string | null
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

function parseList(value: string | undefined): string[] {
  return (value ?? '')
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseApiVersion(value: string | undefined): string {
  const candidate = value?.trim()
  return candidate && /^\d{4}-\d{2}$/.test(candidate)
    ? candidate
    : DEFAULT_SHOPIFY_API_VERSION
}

export function getShopifyRuntimeConfig(): ShopifyRuntimeConfig {
  const shopDomain = parseShopDomain(readEnv('SHOPIFY_SHOP_DOMAIN'))
  const apiKey = readEnv('SHOPIFY_API_KEY')?.trim() || null
  const apiSecret = readEnv('SHOPIFY_API_SECRET')?.trim() || null
  const adminEmailAllowlist = parseList(readEnv('SHOPIFY_ADMIN_EMAIL_ALLOWLIST'))
    .map((email) => email.toLowerCase())
  const adminScopes = parseList(readEnv('SHOPIFY_ADMIN_SCOPES'))
  const storefrontPrivateToken = readEnv('SHOPIFY_STOREFRONT_PRIVATE_TOKEN')?.trim() || null
  const liveConfigurationComplete = Boolean(
    shopDomain && apiKey && apiSecret && adminEmailAllowlist.length && storefrontPrivateToken,
  )

  return {
    mode:
      readEnv('SHOPIFY_MODE')?.trim().toLowerCase() === 'live' && liveConfigurationComplete
        ? 'live'
        : 'preview',
    apiVersion: parseApiVersion(readEnv('SHOPIFY_API_VERSION')),
    shopDomain,
    apiKey,
    apiSecret,
    adminEmailAllowlist,
    adminScopes,
    storefrontPrivateToken,
  }
}
