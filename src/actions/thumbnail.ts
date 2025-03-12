'use server'

import { uploadToBunnyCDN } from '@/lib/upload'

/**
 * Generate thumbnail URL
 * @param htmlContent HTML content or base64 image data
 * @returns Thumbnail URL
 */
export async function generateThumbnail(htmlContent: string): Promise<string> {
  try {
    // Check if it's base64 image data
    if (htmlContent.startsWith('data:image/')) {
      // Extract the base64 data
      const base64Data = htmlContent.replace(/^data:image\/\w+;base64,/, '')

      // Convert to buffer
      const buffer = Buffer.from(base64Data, 'base64')

      // Generate a unique filename using timestamp and random string
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`

      // Upload to BunnyCDN using the server-side utility
      return await uploadToBunnyCDN(buffer, fileName, 'thumbnails')
    }

    // If not base64 image, return default image
    return 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
  } catch (error) {
    console.error('Failed to generate thumbnail:', error)
    // Return default image
    return 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
  }
}
