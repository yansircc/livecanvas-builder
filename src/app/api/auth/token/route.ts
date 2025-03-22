import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Get JWT token for the current user
 * If refresh=true is provided as query parameter, this will refresh the token
 */
export async function GET(request: Request) {
  try {
    // Let Better Auth handle token generation and refreshing
    // Its internal logic handles session validation and token creation
    return auth.handler(request)
  } catch (error) {
    console.error('获取令牌失败:', error)
    return NextResponse.json({ success: false, error: '获取令牌失败' }, { status: 500 })
  }
}
