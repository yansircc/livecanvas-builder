import { env } from '@/env'

/**
 * Replaces image placeholder paths with CDN URLs
 * @param htmlContent The HTML content to process
 * @returns The processed HTML with image placeholders replaced with CDN URLs
 */
export function replaceImagePlaceholders(htmlContent: string): string {
  if (!htmlContent || !env.NEXT_PUBLIC_IMAGE_PLACEHOLDER_PREFIX) {
    return htmlContent
  }

  // Regular expression to match /images/placeholder/x.xxx pattern
  // This will match the pattern in various contexts (src attributes, CSS urls, etc.)
  const placeholderRegex = /\/images\/placeholder\/([^"'\s\)]+)/g

  // Normalize the prefix to ensure consistent handling
  let prefix = env.NEXT_PUBLIC_IMAGE_PLACEHOLDER_PREFIX

  // Remove trailing slash if present for consistent handling
  if (prefix.endsWith('/')) {
    prefix = prefix.slice(0, -1)
  }

  // Check if the prefix already includes the placeholder path
  const includesPlaceholder = prefix.toLowerCase().includes('/placeholder')

  // Count replacements
  let replacementCount = 0
  const processedContent = htmlContent.replace(placeholderRegex, (match, filename) => {
    replacementCount++
    // If the prefix already includes /placeholder/, don't add it again
    return includesPlaceholder ? `${prefix}/${filename}` : `${prefix}/placeholder/${filename}`
  })

  // Only log in development
  if (process.env.NODE_ENV === 'development' && replacementCount > 0) {
    console.log(`Replaced ${replacementCount} image placeholder paths with CDN URLs`)
  }

  return processedContent
}
