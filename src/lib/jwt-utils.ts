import { headers } from 'next/headers'

/**
 * Server-side utilities for Better Auth JWT handling
 */

/**
 * Extracts a JWT token from an Authorization header
 */
export function extractJwtToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Decodes a JWT token without verification
 * This is safe to use for debugging as it doesn't verify the signature
 */
export function decodeJwt(token: string): { header: any; payload: any } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Base64 URL decode functions
    const base64UrlDecode = (str: string): string => {
      // Convert Base64 URL to Base64
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
      // Pad with '=' if needed
      const padding = '='.repeat((4 - (base64.length % 4)) % 4)
      return atob(base64 + padding)
    }

    // Decode header and payload
    const header = JSON.parse(base64UrlDecode(parts[0] ?? ''))
    const payload = JSON.parse(base64UrlDecode(parts[1] ?? ''))

    return { header, payload }
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Gets information about a JWT token for debugging
 */
export function getJwtInfo(token: string | null): Record<string, any> {
  if (!token) {
    return { error: 'No token provided' }
  }

  const decoded = decodeJwt(token)
  if (!decoded) {
    return { error: 'Invalid token format' }
  }

  return {
    header: decoded.header,
    issuer: decoded.payload.iss,
    subject: decoded.payload.sub,
    expires: new Date(decoded.payload.exp * 1000).toISOString(),
    issuedAt: new Date(decoded.payload.iat * 1000).toISOString(),
    userId: decoded.payload.id,
  }
}

/**
 * Verifies a JWT token by making a request to the auth API
 * @param token The JWT token to verify
 * @param baseUrl The base URL for the auth API
 * @returns The verified user data or null if invalid
 */
export async function verifyJwtToken(token: string, baseUrl: string) {
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Gets user data from the headers set by the middleware
 * @returns The user data or null if not available
 */
export async function getUserFromHeaders() {
  try {
    // Get headers - this is a synchronous operation in Next.js
    const headersList = await headers()

    // Extract user data from headers
    const userId = headersList.get('x-user-id')
    const userEmail = headersList.get('x-user-email')

    if (!userId || !userEmail) {
      return null
    }

    return {
      id: userId,
      email: userEmail,
    }
  } catch (error) {
    console.error('Error getting user from headers:', error)
    return null
  }
}
