import { jsonResponse, methodNotAllowed } from './_shared/http.js'
import { clearAdminSessionCookie, requireAdminSession } from './_shared/adminSession.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    const configured = getShopifyRuntimeConfig().adminConfigured
    if (!configured) return jsonResponse({ authenticated: false, configured: false }, 200, {
      'set-cookie': clearAdminSessionCookie(),
    })

    const session = await requireAdminSession(request)
    if (session instanceof Response) {
      if (session.status === 401) return jsonResponse({ authenticated: false, configured: true }, 200, {
        'set-cookie': session.headers.get('set-cookie') ?? '',
      })
      return session
    }

    return jsonResponse({ authenticated: true, email: session.email, configured: true })
  },
}
