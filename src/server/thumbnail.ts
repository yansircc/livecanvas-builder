'use server'

import { nanoid } from 'nanoid'
import { env } from '@/env'

/**
 * 上传图片到 BunnyCDN
 * @param base64Image Base64 编码的图片数据
 * @returns 上传成功后的图片 URL
 */
async function uploadToBunnyCDN(base64Image: string): Promise<string> {
  try {
    // 从 base64 字符串中提取图片数据
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // 生成唯一的文件名
    const fileName = `${nanoid()}.jpg`
    const path = `/thumbnails/${fileName}`

    // 准备请求
    const url = `https://storage.bunnycdn.com/livecanvas-builder${path}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: env.BUNNY_STORAGE_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`)
    }

    // 返回 CDN URL
    return `https://livecanvas-builder.b-cdn.net${path}`
  } catch (error) {
    console.error('上传到 BunnyCDN 失败:', error)
    throw error
  }
}

/**
 * 生成缩略图 URL
 * @param htmlContent HTML 内容或 base64 图片数据
 * @returns 缩略图 URL
 */
export async function generateThumbnail(htmlContent: string): Promise<string> {
  try {
    // 检查是否是 base64 图片数据
    if (htmlContent.startsWith('data:image/')) {
      // 上传到 BunnyCDN
      return await uploadToBunnyCDN(htmlContent)
    }

    // 如果不是 base64 图片，返回默认图片
    return 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
  } catch (error) {
    console.error('生成缩略图失败:', error)
    // 返回默认图片
    return 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
  }
}
