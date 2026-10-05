import type { HomepageContent, StorefrontMedia } from '../../src/types/shopify.js'
import { adminErrorResponse, containsControlCharacters, isRecord } from './_shared/adminHttp.js'
import { hasStaffScope, requireAdminSession, requireSameOrigin } from './_shared/adminSession.js'
import { HttpError, jsonResponse, methodNotAllowed, readJsonBody } from './_shared/http.js'
import { shopifyAdminGraphql, shopifyStorefrontVisibleProductIds } from './_shared/shopifyGraphql.js'

interface ShopifyHomepageResponse {
  metaobjectByHandle: {
    fields: Array<{
      key: string
      value: string | null
      reference: {
        id: string
        image: { url: string; altText: string | null } | null
      } | null
      references: { nodes: Array<{ id: string }> }
    }>
  } | null
}

type ContentInput = HomepageContent

type ShopifyMediaReference = {
  id: string
  image: { url: string; altText: string | null } | null
} | null

const HOMEPAGE_FIELDS = `
  fields {
    key
    value
    reference { ... on MediaImage { id image { url altText } } }
    references(first: 20) { nodes { ... on Product { id } } }
  }
`

const READ_CONTENT_QUERY = `
  query AdminHomepageContent {
    metaobjectByHandle(handle: { type: "mausam_homepage", handle: "home" }) {
      ${HOMEPAGE_FIELDS}
    }
  }
`

const WRITE_CONTENT_MUTATION = `
  mutation SaveAdminHomepage($handle: MetaobjectHandleInput!, $values: JSON!) {
    metaobjectUpsert(handle: $handle, values: $values) {
      metaobject { ${HOMEPAGE_FIELDS} }
      userErrors { field message }
    }
  }
`

function textField(record: Record<string, unknown>, key: string, maxLength: number): string {
  const value = record[key]
  if (typeof value !== 'string' || value.length > maxLength || containsControlCharacters(value, true)) {
    throw new HttpError(`Invalid ${key} value.`, 400)
  }
  return value.trim()
}

function validateHref(value: string, key: string): string {
  if (!value) return ''
  if (containsControlCharacters(value)) throw new HttpError(`Invalid ${key} link.`, 400)
  if (value.startsWith('#')) return value
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes(String.fromCharCode(92))) return value
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch {
    // Rejected below.
  }
  throw new HttpError(`Invalid ${key} link. Use a site path, section link, or HTTPS URL.`, 400)
}

function mediaId(value: unknown, key: string): string | null {
  if (value === null) return null
  if (!isRecord(value) || typeof value.id !== 'string' || !/^gid:\/\/shopify\/MediaImage\/[A-Za-z0-9-]+$/.test(value.id)) {
    throw new HttpError(`Invalid ${key} image reference.`, 400)
  }
  return value.id
}

function contentMedia(id: string | null): StorefrontMedia | null {
  return id ? { id, url: '', altText: null } : null
}

function parseCopyItems(value: unknown, label: string): Array<{ title: string; description: string }> {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new HttpError(`${label} must contain exactly three items.`, 400)
  }
  return value.map((item, index) => {
    if (!isRecord(item)) throw new HttpError(`Invalid ${label} item ${index + 1}.`, 400)
    return {
      title: textField(item, 'title', 180),
      description: textField(item, 'description', 900),
    }
  })
}

function parseEditorialMoments(value: unknown): HomepageContent['editorial']['moments'] {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new HttpError('Editorial must contain exactly four image tiles.', 400)
  }
  return value.map((item, index) => {
    if (!isRecord(item)) throw new HttpError(`Invalid editorial tile ${index + 1}.`, 400)
    return {
      label: textField(item, 'label', 120),
      tag: textField(item, 'tag', 100),
      image: contentMedia(mediaId(item.image, `editorial tile ${index + 1}`)),
    }
  })
}

function parseContent(value: unknown): ContentInput {
  if (!isRecord(value)) throw new HttpError('Homepage content is required.', 400)
  const announcement = value.announcement
  const hero = value.hero
  const gifting = value.gifting
  const craftsmanship = value.craftsmanship
  const editorial = value.editorial
  if (!isRecord(announcement) || !isRecord(hero) || !isRecord(gifting) || !isRecord(craftsmanship) || !isRecord(editorial)) {
    throw new HttpError('Homepage content has an invalid section.', 400)
  }
  if (typeof announcement.enabled !== 'boolean') throw new HttpError('Invalid announcement enabled value.', 400)
  const giftingSteps = parseCopyItems(gifting.steps, 'Gifting steps')
  const craftsmanshipFeatures = parseCopyItems(craftsmanship.features, 'Craftsmanship features')
  const editorialMoments = parseEditorialMoments(editorial.moments)

  const featuredProductIds = value.featuredProductIds
  if (
    !Array.isArray(featuredProductIds) ||
    featuredProductIds.length > 20 ||
    featuredProductIds.some((id) => typeof id !== 'string' || !/^gid:\/\/shopify\/Product\/[A-Za-z0-9-]+$/.test(id)) ||
    new Set(featuredProductIds).size !== featuredProductIds.length
  ) {
    throw new HttpError('Choose up to 20 unique Shopify products.', 400)
  }

  const readText = (section: Record<string, unknown>, key: string, max: number) => textField(section, key, max)
  return {
    announcement: {
      enabled: announcement.enabled,
      text: readText(announcement, 'text', 300),
    },
    hero: {
      eyebrow: readText(hero, 'eyebrow', 180),
      title: readText(hero, 'title', 280),
      body: readText(hero, 'body', 1600),
      primaryCtaLabel: readText(hero, 'primaryCtaLabel', 80),
      primaryCtaHref: validateHref(readText(hero, 'primaryCtaHref', 500), 'hero.primaryCtaHref'),
      secondaryCtaLabel: readText(hero, 'secondaryCtaLabel', 80),
      secondaryCtaHref: validateHref(readText(hero, 'secondaryCtaHref', 500), 'hero.secondaryCtaHref'),
      image: contentMedia(mediaId(hero.image, 'hero')),
      mobileImage: contentMedia(mediaId(hero.mobileImage, 'hero mobile')),
    },
    gifting: {
      eyebrow: readText(gifting, 'eyebrow', 180),
      title: readText(gifting, 'title', 280),
      body: readText(gifting, 'body', 1600),
      ctaLabel: readText(gifting, 'ctaLabel', 80),
      ctaHref: validateHref(readText(gifting, 'ctaHref', 500), 'gifting.ctaHref'),
      secondaryCtaLabel: readText(gifting, 'secondaryCtaLabel', 80),
      secondaryCtaHref: validateHref(readText(gifting, 'secondaryCtaHref', 500), 'gifting.secondaryCtaHref'),
      image: contentMedia(mediaId(gifting.image, 'gifting')),
      steps: giftingSteps,
    },
    craftsmanship: {
      eyebrow: readText(craftsmanship, 'eyebrow', 180),
      title: readText(craftsmanship, 'title', 280),
      body: readText(craftsmanship, 'body', 1600),
      image: contentMedia(mediaId(craftsmanship.image, 'craftsmanship')),
      features: craftsmanshipFeatures,
    },
    editorial: {
      eyebrow: readText(editorial, 'eyebrow', 180),
      title: readText(editorial, 'title', 280),
      moments: editorialMoments,
    },
    featuredProductIds: featuredProductIds as string[],
  }
}

function safeMedia(media: ShopifyMediaReference): StorefrontMedia | null {
  if (!media?.id || !media.image?.url) return null
  try {
    const url = new URL(media.image.url)
    if (
      url.protocol === 'https:' &&
      (url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.shopify.com') || url.hostname.endsWith('.shopifycdn.net'))
    ) {
      return { id: media.id, url: url.href, altText: media.image.altText }
    }
  } catch {
    return null
  }
  return null
}

function storedJsonObjects(value: string | null | undefined): Array<Record<string, unknown>> {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(isRecord) : []
  } catch {
    return []
  }
}

function storedText(record: Record<string, unknown>, key: string, max: number): string {
  return typeof record[key] === 'string' ? record[key].trim().slice(0, max) : ''
}

function normalizedContent(metaobject: NonNullable<ShopifyHomepageResponse['metaobjectByHandle']>): HomepageContent {
  const fields = new Map(metaobject.fields.map((field) => [field.key, field]))
  const text = (key: string, max = 1600) => (fields.get(key)?.value ?? '').trim().slice(0, max)
  const media = (key: string) => safeMedia(fields.get(key)?.reference ?? null)
  const href = (key: string) => validateStoredHref(text(key, 500))
  const products = fields.get('featured_products')?.references.nodes ?? []
  const giftingSteps = storedJsonObjects(fields.get('gifting_steps')?.value).slice(0, 3).map((item) => ({
    title: storedText(item, 'title', 180),
    description: storedText(item, 'description', 900),
  }))
  const craftsmanshipFeatures = storedJsonObjects(fields.get('craftsmanship_features')?.value).slice(0, 3).map((item) => ({
    title: storedText(item, 'title', 180),
    description: storedText(item, 'description', 900),
  }))
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
      primaryCtaHref: href('hero_primary_cta_href'),
      secondaryCtaLabel: text('hero_secondary_cta_label', 80),
      secondaryCtaHref: href('hero_secondary_cta_href'),
      image: media('hero_image'),
      mobileImage: media('hero_mobile_image'),
    },
    gifting: {
      eyebrow: text('gifting_eyebrow', 180),
      title: text('gifting_title', 280),
      body: text('gifting_body'),
      ctaLabel: text('gifting_cta_label', 80),
      ctaHref: href('gifting_cta_href'),
      secondaryCtaLabel: text('gifting_secondary_cta_label', 80),
      secondaryCtaHref: href('gifting_secondary_cta_href'),
      image: media('gifting_image'),
      steps: giftingSteps,
    },
    craftsmanship: {
      eyebrow: text('craftsmanship_eyebrow', 180),
      title: text('craftsmanship_title', 280),
      body: text('craftsmanship_body'),
      image: media('craftsmanship_image'),
      features: craftsmanshipFeatures,
    },
    editorial: {
      eyebrow: text('editorial_eyebrow', 180),
      title: text('editorial_title', 280),
      moments: Array.from({ length: 4 }, (_, index) => {
        const number = index + 1
        return {
          label: text(`editorial_moment_${number}_label`, 120),
          tag: text(`editorial_moment_${number}_tag`, 100),
          image: media(`editorial_moment_${number}_image`),
        }
      }),
    },
    featuredProductIds: products.map(({ id }) => id).slice(0, 20),
  }
}

function validateStoredHref(value: string): string {
  if (!value) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch {
    return value.startsWith('/') && !value.startsWith('//') && !value.includes(String.fromCharCode(92)) || value.startsWith('#')
      ? value
      : ''
  }
}

function contentValues(content: ContentInput): Record<string, unknown> {
  const values: Record<string, unknown> = {
    announcement_enabled: String(content.announcement.enabled),
    announcement_text: content.announcement.text,
    hero_eyebrow: content.hero.eyebrow,
    hero_title: content.hero.title,
    hero_body: content.hero.body,
    hero_primary_cta_label: content.hero.primaryCtaLabel,
    hero_primary_cta_href: content.hero.primaryCtaHref,
    hero_secondary_cta_label: content.hero.secondaryCtaLabel,
    hero_secondary_cta_href: content.hero.secondaryCtaHref,
    gifting_eyebrow: content.gifting.eyebrow,
    gifting_title: content.gifting.title,
    gifting_body: content.gifting.body,
    gifting_cta_label: content.gifting.ctaLabel,
    gifting_cta_href: content.gifting.ctaHref,
    gifting_secondary_cta_label: content.gifting.secondaryCtaLabel,
    gifting_secondary_cta_href: content.gifting.secondaryCtaHref,
    gifting_steps: JSON.stringify(content.gifting.steps),
    craftsmanship_eyebrow: content.craftsmanship.eyebrow,
    craftsmanship_title: content.craftsmanship.title,
    craftsmanship_body: content.craftsmanship.body,
    craftsmanship_features: JSON.stringify(content.craftsmanship.features),
    editorial_eyebrow: content.editorial.eyebrow,
    editorial_title: content.editorial.title,
    featured_products: JSON.stringify(content.featuredProductIds),
  }

  const imageFields: Array<[string, StorefrontMedia | null]> = [
    ['hero_image', content.hero.image],
    ['hero_mobile_image', content.hero.mobileImage],
    ['gifting_image', content.gifting.image],
    ['craftsmanship_image', content.craftsmanship.image],
    ...content.editorial.moments.flatMap((moment, index) => [
      [`editorial_moment_${index + 1}_image`, moment.image] as [string, StorefrontMedia | null],
    ]),
  ]
  for (const [key, image] of imageFields) {
    if (image) values[key] = image.id
  }
  content.editorial.moments.forEach((moment, index) => {
    const number = index + 1
    values[`editorial_moment_${number}_label`] = moment.label
    values[`editorial_moment_${number}_tag`] = moment.tag
  })
  return values
}

async function validateReferences(token: string, content: ContentInput): Promise<void> {
  const productIds = content.featuredProductIds
  const mediaIds = [
    content.hero.image?.id,
    content.hero.mobileImage?.id,
    content.gifting.image?.id,
    content.craftsmanship.image?.id,
    ...content.editorial.moments.map((moment) => moment.image?.id),
  ].filter((id): id is string => Boolean(id))
  const ids = [...new Set([...productIds, ...mediaIds])]
  if (ids.length === 0) return

  const result = await shopifyAdminGraphql<{
    nodes: Array<{ id: string; __typename: string; status?: string } | null>
  }>(token, `
    query ValidateHomepageReferences($ids: [ID!]!) {
      nodes(ids: $ids) {
        id
        __typename
        ... on Product { status }
      }
    }
  `, { ids })
  const found = new Map((result.nodes ?? [])
    .filter((node): node is { id: string; __typename: string; status?: string } => Boolean(node))
    .map((node) => [node.id, node]))

  if (productIds.some((id) => found.get(id)?.__typename !== 'Product' || found.get(id)?.status !== 'ACTIVE')) {
    throw new HttpError('Choose active Shopify products for the featured list.', 400)
  }
  if (productIds.length > 0) {
    const storefrontProductIds = await shopifyStorefrontVisibleProductIds(productIds)
    if (productIds.some((id) => !storefrontProductIds.has(id))) {
      throw new HttpError('Choose products published to the configured Shopify storefront.', 400)
    }
  }
  if (mediaIds.some((id) => found.get(id)?.__typename !== 'MediaImage')) {
    throw new HttpError('One or more selected images are no longer available.', 400)
  }
}

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET' && request.method !== 'POST') return methodNotAllowed('GET, POST')
    if (request.method === 'POST') {
      const originError = requireSameOrigin(request)
      if (originError) return originError
    }

    const session = await requireAdminSession(request)
    if (session instanceof Response) return session
    const neededScope = request.method === 'POST' ? 'write_metaobjects' : 'read_metaobjects'
    if (!hasStaffScope(session, neededScope)) {
      return jsonResponse({ error: 'Your Shopify staff account cannot edit homepage content.' }, 403)
    }

    try {
      if (request.method === 'GET') {
        const result = await shopifyAdminGraphql<ShopifyHomepageResponse>(session.token, READ_CONTENT_QUERY)
        return jsonResponse({
          content: result.metaobjectByHandle ? normalizedContent(result.metaobjectByHandle) : null,
          exists: Boolean(result.metaobjectByHandle),
        })
      }

      const body = await readJsonBody(request, 32_768)
      const content = parseContent(body)
      const selectedImages = [
        content.hero.image,
        content.hero.mobileImage,
        content.gifting.image,
        content.craftsmanship.image,
        ...content.editorial.moments.map((moment) => moment.image),
      ]
      if (content.featuredProductIds.length && !hasStaffScope(session, 'read_products')) {
        return jsonResponse({ error: 'Your Shopify staff account cannot select featured products.' }, 403)
      }
      if (selectedImages.some(Boolean) && !hasStaffScope(session, 'read_files')) {
        return jsonResponse({ error: 'Your Shopify staff account cannot select homepage images.' }, 403)
      }
      await validateReferences(session.token, content)
      const result = await shopifyAdminGraphql<{
        metaobjectUpsert: {
          metaobject: ShopifyHomepageResponse['metaobjectByHandle']
          userErrors: Array<{ field: string[] | null; message: string }>
        }
      }>(session.token, WRITE_CONTENT_MUTATION, {
        handle: { type: 'mausam_homepage', handle: 'home' },
        values: contentValues(content),
      })
      if (result.metaobjectUpsert.userErrors.length > 0 || !result.metaobjectUpsert.metaobject) {
        return jsonResponse({ error: 'Shopify could not save the homepage. Check the mausam_homepage definition and try again.' }, 422)
      }
      return jsonResponse({ content: normalizedContent(result.metaobjectUpsert.metaobject), exists: true })
    } catch (error) {
      return adminErrorResponse(error)
    }
  },
}
