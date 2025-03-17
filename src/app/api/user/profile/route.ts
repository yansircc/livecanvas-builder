import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

export async function PUT(request: Request) {
  try {
    // Get the current user session
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: '未授权' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { name, image, backgroundInfo } = body

    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: '名称是必填项' }, { status: 400 })
    }

    // Update user in database
    await db
      .update(user)
      .set({
        name,
        image,
        backgroundInfo,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    // Get updated user
    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    })

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: '更新用户失败' }, { status: 500 })
    }

    // Return success with updated user data
    return NextResponse.json({
      success: true,
      message: '更新成功',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        backgroundInfo: updatedUser.backgroundInfo,
      },
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    return NextResponse.json({ success: false, error: '更新用户失败' }, { status: 500 })
  }
}
