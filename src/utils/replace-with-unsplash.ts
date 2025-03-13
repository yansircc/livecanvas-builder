import { getUnsplashImage, type ImageCategory } from '@/lib/unsplash'

/**
 * Replaces image placeholder paths with random Unsplash images
 * @param htmlContent The HTML content to process
 * @returns The processed HTML with image placeholders replaced with Unsplash random images
 */
export function replaceWithUnsplashImages(htmlContent: string): string {
  if (!htmlContent) {
    return htmlContent
  }

  // Regular expression to match /images/placeholder/x.xxx pattern
  // This will match the pattern in various contexts (src attributes, CSS urls, etc.)
  const placeholderRegex = /\/images\/placeholder\/([^"'\s\)]+)/g

  // Process all replacements
  let processedContent = htmlContent
  let replacementCount = 0

  // Replace all matches
  processedContent = processedContent.replace(placeholderRegex, (fullMatch, filename) => {
    replacementCount++

    // Determine category (if filename contains category information)
    let category: ImageCategory | undefined = undefined
    if (filename.includes('people')) category = 'people'
    else if (filename.includes('tech')) category = 'technology'
    else if (filename.includes('arch')) category = 'architecture'
    else if (filename.includes('business')) category = 'business'

    // Get a random image URL
    return getUnsplashImage(category)
  })

  // Only log in development
  if (process.env.NODE_ENV === 'development' && replacementCount > 0) {
    console.log(`Replaced ${replacementCount} image placeholder paths with Unsplash images`)
  }

  return processedContent
}
