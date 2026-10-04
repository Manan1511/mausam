import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    const { mode } = getShopifyRuntimeConfig()
    return jsonResponse({ mode, setupRequired: mode !== 'live' })
  },
}
