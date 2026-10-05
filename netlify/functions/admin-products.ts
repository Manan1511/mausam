import { adminErrorResponse, readCursor } from './_shared/adminHttp.js'
import { hasStaffScope, requireAdminSession } from './_shared/adminSession.js'
import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { shopifyAdminGraphql, shopifyStorefrontVisibleProductIds } from './_shared/shopifyGraphql.js'

const PAGE_SIZE = 50

interface ProductsResponse {
  products: {
    nodes: Array<{
      id: string
      handle: string
      title: string
      status: string
      featuredImage: { url: string; altText: string | null } | null
    }>
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

const PRODUCTS_QUERY = `
  query AdminProductChoices($after: String) {
    products(first: ${PAGE_SIZE}, after: $after, sortKey: TITLE, query: "status:active") {
      nodes { id handle title status featuredImage { url altText } }
      pageInfo { hasNextPage endCursor }
    }
  }
`

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    const session = await requireAdminSession(request)
    if (session instanceof Response) return session
    if (!hasStaffScope(session, 'read_products')) {
      return jsonResponse({ error: 'Your Shopify staff account cannot read products.' }, 403)
    }

    try {
      const cursor = readCursor(new URL(request.url).searchParams.get('after'))
      const result = await shopifyAdminGraphql<ProductsResponse>(session.token, PRODUCTS_QUERY, { after: cursor })
      const activeProducts = result.products.nodes
        .filter((product) => product.status === 'ACTIVE' && /^gid:\/\/shopify\/Product\/[A-Za-z0-9-]+$/.test(product.id))
      const visibleIds = await shopifyStorefrontVisibleProductIds(activeProducts.map(({ id }) => id))
      const products = activeProducts
        .filter((product) => visibleIds.has(product.id))
        .map((product) => {
          let image: { url: string; altText: string | null } | null = null
          if (product.featuredImage) {
            try {
              const url = new URL(product.featuredImage.url)
              if (url.protocol === 'https:' && (url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.shopify.com') || url.hostname.endsWith('.shopifycdn.net'))) {
                image = { url: url.href, altText: product.featuredImage.altText }
              }
            } catch {
              image = null
            }
          }
          return { id: product.id, handle: product.handle, title: product.title, image }
        })
      return jsonResponse({ products, pageInfo: result.products.pageInfo })
    } catch (error) {
      return adminErrorResponse(error)
    }
  },
}
