'use server'

/**
 * Generate a thumbnail URL from HTML content
 * This is a placeholder implementation that returns a fixed unsplash image
 * In a real implementation, you would use a service like Puppeteer or a screenshot API
 */
export async function generateThumbnail(_htmlContent: string): Promise<string> {
  // Return a fixed unsplash image as a placeholder
  return 'http://localhost:3000/images/placeholder/1.svg'
}
