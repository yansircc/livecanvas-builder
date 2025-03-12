import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import { uploadToBunnyCDN } from '@/lib/upload'

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { base64Image } = body

    if (!base64Image) {
      return NextResponse.json({ success: false, error: '没有提供图片' }, { status: 400 })
    }

    // Extract the base64 data
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    // Check file size
    const buffer = Buffer.from(base64Data, 'base64')
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: '图片大小不能超过5MB' }, { status: 400 })
    }

    // Generate a unique filename
    const fileName = `${nanoid()}.jpg`

    // Upload to BunnyCDN using the utility function
    const imageUrl = await uploadToBunnyCDN(buffer, fileName, 'avatars')

    return NextResponse.json({ success: true, url: imageUrl })
  } catch (error) {
    console.error('头像上传失败:', error)
    return NextResponse.json({ success: false, error: '头像上传失败' }, { status: 500 })
  }
}
