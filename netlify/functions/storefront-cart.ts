import { isIP } from 'node:net'
import type { Context } from '@netlify/functions'
import { HttpError, jsonResponse, methodNotAllowed, readJsonBody } from './_shared/http.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'
import { shopifyStorefrontGraphql } from './_shared/shopifyGraphql.js'
import type {
  CartOperation,
  StoreProductCategory,
  StorefrontCart,
} from '../../src/types/shopify.js'

interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: {
    nodes: Array<{
      id: string
      quantity: number
      merchandise: {
        id: string
        title: string
        price: { amount: string; currencyCode: string }
        product: {
          handle: string
          title: string
          productType: string
          featuredImage: { url: string; altText: string | null } | null
        }
      } | null
    }>
  }
  cost: {
    subtotalAmount: { amount: string; currencyCode: string }
    totalAmount: { amount: string; currencyCode: string }
  }
}

const CART_FIELDS = `
  fragment StorefrontCartFields on Cart {
    id
    checkoutUrl
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              handle
              title
              productType
              featuredImage { url altText }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
  }
`

const CREATE_CART_MUTATION = `
  mutation CreateStorefrontCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...StorefrontCartFields }
      userErrors { message }
    }
  }
  ${CART_FIELDS}
`

const ADD_LINES_MUTATION = `
  mutation AddStorefrontCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...StorefrontCartFields }
      userErrors { message }
    }
  }
  ${CART_FIELDS}
`

const UPDATE_LINES_MUTATION = `
  mutation UpdateStorefrontCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...StorefrontCartFields }
      userErrors { message }
    }
  }
  ${CART_FIELDS}
`

const REMOVE_LINES_MUTATION = `
  mutation RemoveStorefrontCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...StorefrontCartFields }
      userErrors { message }
    }
  }
  ${CART_FIELDS}
`

const READ_CART_QUERY = `
  query ReadStorefrontCart($cartId: ID!) {
    cart(id: $cartId) { ...StorefrontCartFields }
  }
  ${CART_FIELDS}
`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isGid(value: unknown, type: string): value is string {
  return typeof value === 'string' && new RegExp(`^gid://shopify/${type}/[A-Za-z0-9_-]+$`).test(value)
}

function isCartId(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length <= 512 &&
    /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_-]+(?:\?key=[A-Za-z0-9_=-]+)?$/.test(value)
}

function categoryFromProductType(value: string): StoreProductCategory | null {
  const productType = value.toLowerCase()
  if (productType.includes('candle')) return 'candles'
  if (productType.includes('bouquet') || productType.includes('flower') || productType.includes('floral')) {
    return 'bouquets'
  }
  return null
}

function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      (url.hostname === 'cdn.shopify.com' ||
        url.hostname.endsWith('.shopify.com') ||
        url.hostname.endsWith('.shopifycdn.net'))
      ? url.href
      : null
  } catch {
    return null
  }
}

function safeCheckoutUrl(value: string, allowedHosts: string[]): string | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' &&
      !url.username && !url.password &&
      (!url.port || url.port === '443') &&
      allowedHosts.includes(url.hostname.toLowerCase())
      ? url.href
      : null
  } catch {
    return null
  }
}

function normalizeCart(cart: ShopifyCart, allowedHosts: string[]): StorefrontCart {
  return {
    id: cart.id,
    checkoutUrl: safeCheckoutUrl(cart.checkoutUrl, allowedHosts),
    lines: cart.lines.nodes.flatMap((line) => {
      const variant = line.merchandise
      if (!variant) return []
      return [{
        id: line.id,
        variantId: variant.id,
        quantity: line.quantity,
        title: variant.product.title,
        variantTitle: variant.title,
        productHandle: variant.product.handle,
        category: categoryFromProductType(variant.product.productType),
        imageUrl: safeImageUrl(variant.product.featuredImage?.url),
        unitPrice: variant.price,
      }]
    }),
    subtotal: cart.cost.subtotalAmount,
    total: cart.cost.totalAmount,
  }
}

async function readMutationCart<T extends { cart: ShopifyCart | null; userErrors: Array<{ message: string }> }>(
  query: string,
  variables: Record<string, unknown>,
  buyerIp: string,
): Promise<T> {
  const result = await shopifyStorefrontGraphql<T>(query, variables, buyerIp)
  if (result.userErrors?.length) {
    const message = result.userErrors[0]?.message?.slice(0, 240) || 'The cart could not be updated.'
    throw new HttpError(message, 400)
  }
  if (!result.cart) throw new HttpError('Shopify did not return a cart.', 502)
  return result
}

function parseOperation(value: unknown): CartOperation {
  if (!isRecord(value) || typeof value.action !== 'string') {
    throw new HttpError('Choose a valid cart operation.', 400)
  }

  switch (value.action) {
    case 'create':
      return { action: 'create' }
    case 'read':
      if (!isCartId(value.cartId)) throw new HttpError('The cart is invalid or expired.', 400)
      return { action: 'read', cartId: value.cartId }
    case 'add':
      if (value.cartId !== undefined && !isCartId(value.cartId)) {
        throw new HttpError('The cart is invalid or expired.', 400)
      }
      if (!isGid(value.variantId, 'ProductVariant')) throw new HttpError('Choose a valid product option.', 400)
      if (!Number.isInteger(value.quantity) || Number(value.quantity) < 1 || Number(value.quantity) > 99) {
        throw new HttpError('Choose a quantity between 1 and 99.', 400)
      }
      return {
        action: 'add',
        ...(value.cartId ? { cartId: value.cartId } : {}),
        variantId: value.variantId,
        quantity: Number(value.quantity),
      }
    case 'update':
      if (!isCartId(value.cartId)) throw new HttpError('The cart is invalid or expired.', 400)
      if (!isGid(value.lineId, 'CartLine')) throw new HttpError('The cart line is invalid.', 400)
      if (!Number.isInteger(value.quantity) || Number(value.quantity) < 1 || Number(value.quantity) > 99) {
        throw new HttpError('Choose a quantity between 1 and 99.', 400)
      }
      return {
        action: 'update',
        cartId: value.cartId,
        lineId: value.lineId,
        quantity: Number(value.quantity),
      }
    case 'remove':
      if (!isCartId(value.cartId)) throw new HttpError('The cart is invalid or expired.', 400)
      if (!isGid(value.lineId, 'CartLine')) throw new HttpError('The cart line is invalid.', 400)
      return { action: 'remove', cartId: value.cartId, lineId: value.lineId }
    case 'checkout':
      if (!isCartId(value.cartId)) throw new HttpError('The cart is invalid or expired.', 400)
      return { action: 'checkout', cartId: value.cartId }
    default:
      throw new HttpError('Choose a valid cart operation.', 400)
  }
}

export default {
  fetch: async (request: Request, context: Context) => {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    const config = getShopifyRuntimeConfig()
    if (config.mode !== 'live') {
      return jsonResponse({ error: 'Checkout is unavailable in preview mode.' }, 409)
    }
    if (!isIP(context.ip)) {
      return jsonResponse({ error: 'The Shopify cart service is unavailable.' }, 503)
    }

    try {
      const operation = parseOperation(await readJsonBody(request))
      let cart: ShopifyCart | null = null

      if (operation.action === 'create') {
        const result = await readMutationCart<{
          cart: ShopifyCart | null
          userErrors: Array<{ message: string }>
        }>(CREATE_CART_MUTATION, { lines: [] }, context.ip)
        cart = result.cart
      } else if (operation.action === 'read' || operation.action === 'checkout') {
        const result = await shopifyStorefrontGraphql<{ cart: ShopifyCart | null }>(
          READ_CART_QUERY,
          { cartId: operation.cartId },
          context.ip,
        )
        cart = result.cart
        if (!cart) throw new HttpError('Your Shopify cart expired. Please start a new bag.', 410)
      } else if (operation.action === 'add' && !operation.cartId) {
        const result = await readMutationCart<{
          cart: ShopifyCart | null
          userErrors: Array<{ message: string }>
        }>(CREATE_CART_MUTATION, {
          lines: [{ merchandiseId: operation.variantId, quantity: operation.quantity }],
        }, context.ip)
        cart = result.cart
      } else if (operation.action === 'add') {
        const result = await readMutationCart<{
          cart: ShopifyCart | null
          userErrors: Array<{ message: string }>
        }>(ADD_LINES_MUTATION, {
          cartId: operation.cartId,
          lines: [{ merchandiseId: operation.variantId, quantity: operation.quantity }],
        }, context.ip)
        cart = result.cart
      } else if (operation.action === 'update') {
        const result = await readMutationCart<{
          cart: ShopifyCart | null
          userErrors: Array<{ message: string }>
        }>(UPDATE_LINES_MUTATION, {
          cartId: operation.cartId,
          lines: [{ id: operation.lineId, quantity: operation.quantity }],
        }, context.ip)
        cart = result.cart
      } else if (operation.action === 'remove') {
        const result = await readMutationCart<{
          cart: ShopifyCart | null
          userErrors: Array<{ message: string }>
        }>(REMOVE_LINES_MUTATION, {
          cartId: operation.cartId,
          lineIds: [operation.lineId],
        }, context.ip)
        cart = result.cart
      }

      if (!cart) throw new HttpError('Shopify did not return a cart.', 502)
      const normalized = normalizeCart(cart, config.checkoutAllowedHosts)
      if (operation.action === 'checkout' && !normalized.checkoutUrl) {
        throw new HttpError('Shopify returned an unapproved checkout address.', 502)
      }

      return jsonResponse({ cart: normalized })
    } catch (error) {
      if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status)
      return jsonResponse({ error: 'The Shopify cart is temporarily unavailable.' }, 503)
    }
  },
}
