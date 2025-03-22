import { unstable_noStore as noStore } from 'next/cache'
import { headers } from 'next/headers'

/**
 * Safely gets the request headers, handling potential errors during prerendering
 * This utility helps prevent the HANGING_PROMISE_REJECTION issue in Next.js
 * when accessing headers during static generation or prerendering.
 *
 * @returns Headers object or null if headers cannot be accessed
 */
export async function getSafeHeaders(): Promise<Headers | null> {
  // Explicitly mark this function as uncacheable
  noStore()

  try {
    return await headers()
  } catch (error) {
    console.error('Headers access error (likely during prerendering):', error)
    return null
  }
}

// Helper type for header values that handles undefined
type HeaderValue = string | null

/**
 * Gets a header value safely, with proper typing
 *
 * @param headers Headers object
 * @param name Header name
 * @returns Header value as string or null
 */
function getHeaderValue(headers: Headers, name: string): HeaderValue {
  const value = headers.get(name)
  return value === undefined || value === null ? null : value
}

/**
 * Gets a cookie value safely, handling potential errors during prerendering
 *
 * @param name Cookie name to get
 * @returns Cookie value or null if not found or headers cannot be accessed
 */
export async function getSafeCookie(name: string): Promise<HeaderValue> {
  const headersList = await getSafeHeaders()
  if (!headersList) return null

  const cookieHeader = getHeaderValue(headersList, 'cookie')
  if (!cookieHeader) return null

  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? (match[2] ?? null) : null
}

/**
 * Gets an authorization header safely, handling potential errors
 *
 * @returns Authorization header value or null
 */
export async function getSafeAuthorization(): Promise<HeaderValue> {
  const headersList = await getSafeHeaders()
  if (!headersList) return null

  return getHeaderValue(headersList, 'authorization')
}
