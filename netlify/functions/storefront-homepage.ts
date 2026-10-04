import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'
import { shopifyStorefrontGraphql } from './_shared/shopifyGraphql.js'
import type { HomepageContent, StorefrontMedia } from '../../src/types/shopify.js'

interface ShopifyHomepageResponse {
  metaobject: {
    fields: Array<{
      key: string
      value: string | null
      reference: {
        id?: string
        image?: { url: string; altText: string | null } | null
      } | null
      references: { nodes: Array<{ id: string }> }
    }>
  } | null
}

type ShopifyHomepageField = NonNullable<ShopifyHomepageResponse['metaobject']>['fields'][number]

const HOMEPAGE_QUERY = `
  query StorefrontHomepage {
    metaobject(handle: { type: "mausam_homepage", handle: "home" }) {
      fields {
        key
        value
        reference {
          ... on MediaImage { id image { url altText } }
        }
        references(first: 20) {
          nodes { ... on Product { id } }
        }
      }
    }
  }
`

function asText(value: string | null | undefined, maxLength = 1600): string {
  return (value ?? '').trim().slice(0, maxLength)
}

function safeHref(value: string | null | undefined): string {
  const href = asText(value, 500)
  if (href.startsWith('#')) return href
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes(String.fromCharCode(92))) return href
  try {
    const url = new URL(href)
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function safeMedia(field: ShopifyHomepageField): StorefrontMedia | null {
  const media = field.reference
  const image = media?.image
  if (!media?.id || !image?.url) return null

  try {
    const url = new URL(image.url)
    const isShopifyCdn =
      url.protocol === 'https:' &&
      (url.hostname === 'cdn.shopify.com' ||
        url.hostname.endsWith('.shopify.com') ||
        url.hostname.endsWith('.shopifycdn.net'))
    return isShopifyCdn
      ? { id: media.id, url: url.href, altText: image.altText }
      : null
  } catch {
    return null
  }
}

function normalizeHomepage(metaobject: NonNullable<ShopifyHomepageResponse['metaobject']>): HomepageContent {
  const fields = new Map(metaobject.fields.map((field) => [field.key, field]))
  const text = (key: string, maxLength?: number) => asText(fields.get(key)?.value, maxLength)
  const media = (key: string) => {
    const field = fields.get(key)
    return field ? safeMedia(field) : null
  }
  const features = fields.get('featured_products')?.references.nodes ?? []

  return {
    announcement: {
      enabled: text('announcement_enabled', 5).toLowerCase() === 'true',
      text: text('announcement_text', 300),
    },
    hero: {
      eyebrow: text('hero_eyebrow', 180),
      title: text('hero_title', 280),
      body: text('hero_body'),
      primaryCtaLabel: text('hero_primary_cta_label', 80),
      primaryCtaHref: safeHref(text('hero_primary_cta_href', 500)),
      secondaryCtaLabel: text('hero_secondary_cta_label', 80),
      secondaryCtaHref: safeHref(text('hero_secondary_cta_href', 500)),
      image: media('hero_image'),
      mobileImage: media('hero_mobile_image'),
    },
    gifting: {
      eyebrow: text('gifting_eyebrow', 180),
      title: text('gifting_title', 280),
      body: text('gifting_body'),
      ctaLabel: text('gifting_cta_label', 80),
      ctaHref: safeHref(text('gifting_cta_href', 500)),
      image: media('gifting_image'),
    },
    craftsmanship: {
      eyebrow: text('craftsmanship_eyebrow', 180),
      title: text('craftsmanship_title', 280),
      body: text('craftsmanship_body'),
      image: media('craftsmanship_image'),
    },
    editorial: {
      eyebrow: text('editorial_eyebrow', 180),
      title: text('editorial_title', 280),
      body: text('editorial_body'),
      ctaLabel: text('editorial_cta_label', 80),
      ctaHref: safeHref(text('editorial_cta_href', 500)),
      image: media('editorial_image'),
    },
    featuredProductIds: features.map(({ id }) => id).slice(0, 20),
  }
}

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    if (getShopifyRuntimeConfig().mode !== 'live') return jsonResponse({ content: null })

    try {
      const result = await shopifyStorefrontGraphql<ShopifyHomepageResponse>(HOMEPAGE_QUERY)
      return jsonResponse({ content: result.metaobject ? normalizeHomepage(result.metaobject) : null })
    } catch {
      return jsonResponse({ error: 'The Shopify homepage content is temporarily unavailable.' }, 503)
    }
  },
}
