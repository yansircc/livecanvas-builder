import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { api } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'

/**
 * API endpoint to regenerate the JWT token with the latest user data
 * This ensures the JWT payload contains the most up-to-date user information
 */
export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    // Get the latest user data from the database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    })

    if (!userData) {
      return NextResponse.json({ success: false, error: '用户未找到' }, { status: 404 })
    }

    // 刷新会话 - 这会触发Better Auth内部重新生成JWT令牌
    // Better Auth会使用definePayload中定义的逻辑来构建JWT payload
    const headersList = await headers()
    await api.getSession({ asResponse: true, headers: headersList })

    // 返回成功响应
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('重新生成令牌失败:', error)
    return NextResponse.json({ success: false, error: '重新生成令牌失败' }, { status: 500 })
  }
}
