import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * API endpoint to forward requests to the JWT token endpoint
 * This makes it easier to access the token from client-side code
 */
export async function GET(request: Request) {
  try {
    // Simply forward to the auth handler which will process the request and return the token
    // Specific JWT plugin path will be handled automatically
    return auth.handler(request)
  } catch (error) {
    console.error('Failed to get token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
