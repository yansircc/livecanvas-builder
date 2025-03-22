import { NextResponse } from 'next/server'
import { api } from '@/lib/auth'

/**
 * Example of a protected API endpoint that uses JWT for authentication
 */
export async function GET(request: Request) {
  try {
    // 使用Better Auth api.getSession直接验证JWT令牌
    // 文档：https://www.better-auth.com/docs/plugins/bearer
    const session = await api.getSession({
      headers: request.headers,
    })

    // 如果没有会话，返回未授权错误
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 会话验证成功，返回保护数据
    return NextResponse.json({
      message: 'Successfully authenticated with JWT',
      user: session.user,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Protected API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
