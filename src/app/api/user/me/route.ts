import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

/**
 * API endpoint to fetch the complete user data including backgroundInfo
 * 验证由中间件处理，这里只用于获取用户数据
 */
export async function GET() {
  try {
    // 获取当前用户会话（用于用户数据，不负责验证）
    // 如果代码执行到这里，中间件已经验证了用户身份
    const session = await getServerSession()
    if (!session) {
      // 理论上不应发生，因为中间件已经处理了验证
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    // Get the complete user data from the database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    })

    if (!userData) {
      return NextResponse.json({ success: false, error: '用户未找到' }, { status: 404 })
    }

    // Return the complete user data
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        backgroundInfo: userData.backgroundInfo,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    })
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return NextResponse.json({ success: false, error: '获取用户数据失败' }, { status: 500 })
  }
}
