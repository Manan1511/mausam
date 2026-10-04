import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { createOAuthState, oauthStateCookie, requireSameOrigin } from './_shared/adminSession.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    const originError = requireSameOrigin(request)
    if (originError) return originError

    const config = getShopifyRuntimeConfig()
    if (!config.adminConfigured || !config.shopDomain || !config.apiKey || !config.appOrigin) {
      return jsonResponse({ error: 'Shopify admin sign-in is not configured yet.' }, 503)
    }

    const state = createOAuthState()
    const authorizationUrl = new URL(`https://${config.shopDomain}/admin/oauth/authorize`)
    authorizationUrl.searchParams.set('client_id', config.apiKey)
    authorizationUrl.searchParams.set('scope', config.adminScopes.join(','))
    authorizationUrl.searchParams.set('redirect_uri', `${config.appOrigin}/api/admin/auth/callback`)
    authorizationUrl.searchParams.set('state', state)
    authorizationUrl.searchParams.set('grant_options[]', 'per-user')

    return jsonResponse({ authorizationUrl: authorizationUrl.href }, 200, {
      'set-cookie': oauthStateCookie(state),
      'referrer-policy': 'no-referrer',
    })
  },
}
