import { HttpError, jsonResponse } from './http.js'
import { ShopifyApiError } from './shopifyGraphql.js'

export function adminErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status)
  }

  if (error instanceof ShopifyApiError) {
    if (error.code === 'NOT_CONFIGURED') {
      return jsonResponse({ error: 'The private Shopify Storefront token is not configured. Add it before managing featured products.' }, 503)
    }
    if (error.status === 401) {
      return jsonResponse({ error: 'Your Shopify session has expired. Sign in again.' }, 401)
    }
    if (error.status === 403) {
      return jsonResponse({ error: 'Your Shopify staff account does not have permission for this action.' }, 403)
    }
    return jsonResponse({ error: 'Shopify is temporarily unavailable. Please try again.' }, 503)
  }

  return jsonResponse({ error: 'The admin request could not be completed.' }, 500)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function containsControlCharacters(value: string, allowTextWhitespace = false): boolean {
  return Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0
    const allowedWhitespace = allowTextWhitespace && (code === 9 || code === 10 || code === 13)
    return (code >= 0 && code <= 31 && !allowedWhitespace) || code === 127
  })
}

export function readCursor(value: string | null): string | null {
  if (
    value !== null &&
    (value.length === 0 || value.length > 512 || containsControlCharacters(value))
  ) {
    throw new HttpError('Invalid pagination cursor.', 400)
  }
  return value
}
