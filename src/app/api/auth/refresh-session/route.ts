import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { db } from '@/server/db'
import { user } from '@/server/db/schema'

/**
 * API endpoint to refresh the user session with the latest data from the database
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

    // Return the latest user data
    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
      },
    })
  } catch (error) {
    console.error('刷新会话失败:', error)
    return NextResponse.json({ success: false, error: '刷新会话失败' }, { status: 500 })
  }
}
