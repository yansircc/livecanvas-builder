import { processHtml } from '@/utils/process-html'

/**
 * Loads HTML content from localStorage based on the content ID
 * @param contentId The ID of the content to load
 * @returns The processed HTML content or an error message
 */
export function loadContentFromStorage(contentId: string | null): string {
  if (!contentId) {
    return '<div class="error-container"><h3>Invalid Request</h3><p>No preview content ID specified</p></div>'
  }

  const savedContent = localStorage.getItem(`preview_content_${contentId}`)

  if (!savedContent) {
    return '<div class="error-container"><h3>Content Not Found</h3><p>The preview content is unavailable or has expired</p></div>'
  }

  try {
    return processHtml(savedContent)
  } catch (error) {
    console.error('Error processing HTML content:', error)
    return savedContent
  }
}

/**
 * Gets the original unprocessed content from localStorage
 * @param contentId The ID of the content to load
 * @returns The original unprocessed content or empty string
 */
export function getOriginalContent(contentId: string | null): string {
  if (!contentId) {
    return ''
  }

  return localStorage.getItem(`preview_content_${contentId}`) ?? ''
}
