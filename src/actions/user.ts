'use server'

import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

export async function getCurrentUser() {
  const session = await getServerSession()

  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  const userData = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  if (!userData) {
    return { success: false, error: 'User not found' }
  }

  return {
    success: true,
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      backgroundInfo: userData.backgroundInfo,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    },
  }
}

export async function updateUserProfile(formData: {
  name: string
  image?: string | null
  backgroundInfo?: string | null
}) {
  const session = await getServerSession()

  if (!session) {
    return { success: false, error: 'Unauthorized' }
  }

  const { name, image, backgroundInfo } = formData

  if (!name || name.trim() === '') {
    return { success: false, error: 'Name is required' }
  }

  await db
    .update(user)
    .set({
      name,
      image,
      backgroundInfo,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))

  const updatedUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  })

  if (!updatedUser) {
    return { success: false, error: 'Failed to update user' }
  }

  return {
    success: true,
    message: 'Updated successfully',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      backgroundInfo: updatedUser.backgroundInfo,
    },
  }
}
