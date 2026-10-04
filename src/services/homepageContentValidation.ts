import type { HomepageContent, StorefrontMedia } from '../types/shopify'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function containsForbiddenControl(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0)
    return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127
  })
}

function readText(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string' || value.length > maxLength || containsForbiddenControl(value)) {
    throw new TypeError(`Homepage content contains an invalid ${label}.`)
  }
  return value
}

function readHref(value: unknown, label: string): string {
  const href = readText(value, label, 500).trim()
  if (!href || href.startsWith('#')) return href
  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) return href
  try {
    const url = new URL(href)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch {
    // Rejected below.
  }
  throw new TypeError(`Homepage content contains an unsafe ${label}.`)
}

function readMedia(value: unknown, label: string): StorefrontMedia | null {
  if (value === null) return null
  if (!isRecord(value)) throw new TypeError(`Homepage content contains an invalid ${label} image.`)
  const id = readText(value.id, `${label} image ID`, 200)
  const imageUrl = readText(value.url, `${label} image URL`, 2048)
  const altText = value.altText === null ? null : readText(value.altText, `${label} image description`, 500)
  if (!/^gid:\/\/shopify\/MediaImage\/[A-Za-z0-9-]+$/.test(id)) {
    throw new TypeError(`Homepage content contains an invalid ${label} image ID.`)
  }
  let url: URL
  try {
    url = new URL(imageUrl)
  } catch {
    throw new TypeError(`Homepage content contains an invalid ${label} image URL.`)
  }
  if (
    url.protocol !== 'https:' || url.username || url.password ||
    !(url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.shopify.com') || url.hostname.endsWith('.shopifycdn.net'))
  ) {
    throw new TypeError(`Homepage content contains an unsafe ${label} image URL.`)
  }
  return { id, url: url.href, altText }
}

function readCopyItems(
  value: unknown,
  label: string,
  count: number,
): Array<{ title: string; description: string }> {
  if (!Array.isArray(value) || value.length !== count) {
    throw new TypeError(`Homepage content contains invalid ${label}.`)
  }
  return value.map((item) => {
    if (!isRecord(item)) throw new TypeError(`Homepage content contains an invalid ${label} item.`)
    return {
      title: readText(item.title, `${label} title`, 180),
      description: readText(item.description, `${label} description`, 900),
    }
  })
}

export function validateHomepageContent(value: unknown): HomepageContent | null {
  if (value === null) return null
  if (!isRecord(value)) throw new TypeError('Shopify returned invalid homepage content.')
  const announcement = value.announcement
  const hero = value.hero
  const gifting = value.gifting
  const craftsmanship = value.craftsmanship
  const editorial = value.editorial
  if (!isRecord(announcement) || !isRecord(hero) || !isRecord(gifting) || !isRecord(craftsmanship) || !isRecord(editorial)) {
    throw new TypeError('Shopify returned an invalid homepage section.')
  }
  if (typeof announcement.enabled !== 'boolean') throw new TypeError('Shopify returned an invalid announcement state.')

  const featuredProductIds = value.featuredProductIds
  if (
    !Array.isArray(featuredProductIds) || featuredProductIds.length > 20 ||
    featuredProductIds.some((id) => typeof id !== 'string' || !/^gid:\/\/shopify\/Product\/[A-Za-z0-9-]+$/.test(id)) ||
    new Set(featuredProductIds).size !== featuredProductIds.length
  ) {
    throw new TypeError('Shopify returned an invalid featured-product list.')
  }

  const moments = editorial.moments
  if (!Array.isArray(moments) || moments.length !== 4) throw new TypeError('Shopify returned invalid editorial tiles.')
  const editorialMoments = moments.map((moment) => {
    if (!isRecord(moment)) throw new TypeError('Shopify returned an invalid editorial tile.')
    return {
      label: readText(moment.label, 'editorial label', 120),
      tag: readText(moment.tag, 'editorial tag', 100),
      image: readMedia(moment.image, 'editorial'),
    }
  })

  return {
    announcement: {
      enabled: announcement.enabled,
      text: readText(announcement.text, 'announcement text', 300),
    },
    hero: {
      eyebrow: readText(hero.eyebrow, 'hero eyebrow', 180),
      title: readText(hero.title, 'hero title', 280),
      body: readText(hero.body, 'hero body', 1600),
      primaryCtaLabel: readText(hero.primaryCtaLabel, 'hero primary CTA label', 80),
      primaryCtaHref: readHref(hero.primaryCtaHref, 'hero primary CTA link'),
      secondaryCtaLabel: readText(hero.secondaryCtaLabel, 'hero secondary CTA label', 80),
      secondaryCtaHref: readHref(hero.secondaryCtaHref, 'hero secondary CTA link'),
      image: readMedia(hero.image, 'hero'),
      mobileImage: readMedia(hero.mobileImage, 'mobile hero'),
    },
    gifting: {
      eyebrow: readText(gifting.eyebrow, 'gifting eyebrow', 180),
      title: readText(gifting.title, 'gifting title', 280),
      body: readText(gifting.body, 'gifting body', 1600),
      ctaLabel: readText(gifting.ctaLabel, 'gifting CTA label', 80),
      ctaHref: readHref(gifting.ctaHref, 'gifting CTA link'),
      secondaryCtaLabel: readText(gifting.secondaryCtaLabel, 'secondary gifting CTA label', 80),
      secondaryCtaHref: readHref(gifting.secondaryCtaHref, 'secondary gifting CTA link'),
      image: readMedia(gifting.image, 'gifting'),
      steps: readCopyItems(gifting.steps, 'gifting steps', 3),
    },
    craftsmanship: {
      eyebrow: readText(craftsmanship.eyebrow, 'craftsmanship eyebrow', 180),
      title: readText(craftsmanship.title, 'craftsmanship title', 280),
      body: readText(craftsmanship.body, 'craftsmanship body', 1600),
      image: readMedia(craftsmanship.image, 'craftsmanship'),
      features: readCopyItems(craftsmanship.features, 'craftsmanship features', 3),
    },
    editorial: {
      eyebrow: readText(editorial.eyebrow, 'editorial eyebrow', 180),
      title: readText(editorial.title, 'editorial title', 280),
      moments: editorialMoments,
    },
    featuredProductIds: featuredProductIds as string[],
  }
}
