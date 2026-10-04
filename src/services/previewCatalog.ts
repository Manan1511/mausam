import { bestsellers, productsByCategory } from '../data.js'
import type { StoreProduct, StoreProductCategory } from '../types/shopify.js'

function parsePreviewPrice(value: string): string {
  const amount = Number(value.replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

function mapPreviewProduct(product: {
  id: string
  name: string
  category: StoreProductCategory
  subtitle: string
  description: string
  price: string
  image: string
  badge?: string
  specs: StoreProduct['specs']
}): StoreProduct {
  const amount = parsePreviewPrice(product.price)
  const price = { amount, currencyCode: 'INR' }
  const image = { url: product.image, altText: product.name }

  return {
    id: `preview:${product.id}`,
    handle: product.id,
    title: product.name,
    category: product.category,
    subtitle: product.subtitle,
    badge: product.badge ?? null,
    description: product.description,
    vendor: 'Mausam Artwork',
    availableForSale: true,
    image,
    priceRange: { min: price, max: price },
    variants: [
      {
        id: `preview:variant:${product.id}`,
        title: 'Standard',
        sku: null,
        availableForSale: true,
        price,
        selectedOptions: [],
      },
    ],
    specs: product.specs,
  }
}

export const previewProducts: StoreProduct[] = [
  ...productsByCategory.candles,
  ...productsByCategory.bouquets,
].map(mapPreviewProduct)

export const previewFeaturedProducts: StoreProduct[] = bestsellers.flatMap((item) => {
  const matchingProduct = previewProducts.find((product) => product.image?.url === item.image)
  const amount = parsePreviewPrice(item.price)
  const price = { amount, currencyCode: 'INR' }

  if (matchingProduct) {
    return [
      {
        ...matchingProduct,
        title: item.name,
        subtitle: item.notes,
        description: item.notes,
        priceRange: { min: price, max: price },
        variants: matchingProduct.variants.map((variant) => ({ ...variant, price })),
      },
    ]
  }

  return [
    mapPreviewProduct({
      id: item.id,
      name: item.name,
      category: item.category,
      subtitle: item.notes,
      description: item.notes,
      price: item.price,
      image: item.image,
      specs: {},
    }),
  ]
})
