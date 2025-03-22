import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/actions/user'

export async function GET() {
  try {
    const authResult = await getCurrentUser()
    return NextResponse.json(authResult)
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 },
    )
  }
}
