import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { auth } from '@/lib/auth'
import { getServerSession } from '@/lib/auth-server'

/**
 * API endpoint to update the user session with the latest data from the database
 * This is a workaround for better-auth's limitation in updating session data
 */
export async function GET(request: Request) {
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

    // Create a new session with the updated user data
    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        backgroundInfo: userData.backgroundInfo,
      },
    }

    // Return the updated session data
    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error('更新会话失败:', error)
    return NextResponse.json({ success: false, error: '更新会话失败' }, { status: 500 })
  }
}
