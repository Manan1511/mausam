import { clearAdminSessionCookie, deleteAdminSession, getAdminSessionId, requireSameOrigin } from './_shared/adminSession.js'
import { jsonResponse, methodNotAllowed } from './_shared/http.js'

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    const originError = requireSameOrigin(request)
    if (originError) return originError

    const sessionId = getAdminSessionId(request)
    if (sessionId) await deleteAdminSession(sessionId)
    return jsonResponse({ authenticated: false }, 200, { 'set-cookie': clearAdminSessionCookie() })
  },
}
