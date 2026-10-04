import { ambientMoments, craftFeatures, giftSteps } from '../data'
import type { HomepageContent } from '../types/shopify'

export interface AdminSessionResponse {
  authenticated: boolean
  configured: boolean
  email?: string
}

export interface AdminProductChoice {
  id: string
  handle: string
  title: string
  image: { url: string; altText: string | null } | null
}

export interface AdminMediaChoice {
  id: string
  altText: string | null
  url: string | null
  fileStatus: string
}

export interface AdminPageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  announcement: {
    enabled: true,
    text: 'Hand-Poured Scented Candles | Bespoke Everlasting Bouquets | Crafted with Love in India',
  },
  hero: {
    eyebrow: 'Handcrafted Scent & Floral Atelier',
    title: 'Artisanal Candles & Bespoke Bouquets.',
    body: 'Hand-poured botanical soy candles and everlasting preserved floral keepsakes. Individually handcrafted in our atelier to bring fragrance, warmth, and timeless beauty into every space.',
    primaryCtaLabel: 'Explore Collections',
    primaryCtaHref: '#offerings',
    secondaryCtaLabel: 'Bespoke Gifting →',
    secondaryCtaHref: '#gifting',
    image: null,
    mobileImage: null,
  },
  gifting: {
    eyebrow: 'The Gifting Atelier',
    title: 'Thoughtful Keepsakes & Bespoke Gifting',
    body: 'From birthday surprises and anniversary boxes to wedding favors and festive corporate hampers, each piece is packaged to delight.',
    ctaLabel: 'Explore Gifting Curations',
    ctaHref: '#offerings',
    secondaryCtaLabel: 'WhatsApp Bespoke Inquiry →',
    secondaryCtaHref: 'https://wa.me/919876543210?text=Hello%20Mausam%20Artwork,%20I%20would%20like%20to%20inquire%20about%20bespoke%20gifting',
    image: null,
    steps: giftSteps.map(({ title, description }) => ({ title, description })),
  },
  craftsmanship: {
    eyebrow: 'Our Standard',
    title: 'The Art of Clean Botanical Craft',
    body: 'Every piece is poured and arranged with mindfulness, using 100% natural wax, premium phthalate-free oils, and everlasting botanical blooms.',
    image: null,
    features: craftFeatures.map(({ title, description }) => ({ title, description })),
  },
  editorial: {
    eyebrow: 'Editorial',
    title: 'Ambient Moments',
    moments: ambientMoments.map(({ label, tag }) => ({ label, tag, image: null })),
  },
  featuredProductIds: [],
}

export function cloneHomepageContent(content: HomepageContent): HomepageContent {
  return structuredClone(content)
}
