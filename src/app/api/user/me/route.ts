import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

/**
 * API endpoint to fetch the complete user data including backgroundInfo
 */
export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession()
    if (!session) {
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
