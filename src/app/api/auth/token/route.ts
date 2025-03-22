import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'

/**
 * 获取当前用户的JWT令牌
 * 如果请求中包含refresh=true查询参数，则会刷新令牌
 */
export async function GET(request: Request) {
  try {
    // 获取当前会话
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: '未授权，请先登录' }, { status: 401 })
    }

    // 解析URL并检查是否需要刷新令牌
    const url = new URL(request.url)
    const shouldRefresh = url.searchParams.get('refresh') === 'true'

    if (shouldRefresh) {
      // 获取最新的用户数据
      const userData = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
      })

      if (!userData) {
        return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
      }

      // 我们可以将整个请求简单地传递给auth.handler
      // 让Better Auth内部处理JWT生成和cookie设置
      // 由于我们修改了definePayload函数，如果用户数据有更新，
      // 这将自动将最新的用户数据包含在JWT令牌中
      return auth.handler(request)
    }

    // 如果不需要刷新，直接将请求传递给auth.handler
    // 它会处理令牌的获取和返回
    return auth.handler(request)
  } catch (error) {
    console.error('获取令牌失败:', error)
    return NextResponse.json({ success: false, error: '获取令牌失败' }, { status: 500 })
  }
}
