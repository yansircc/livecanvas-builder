import { useCallback } from 'react'

export function usePreview() {
  // Open preview window
  const openPreview = useCallback((html: string) => {
    const contentId = Date.now().toString()
    sessionStorage.setItem(`preview_content_${contentId}`, html)
    window.open(`/preview?id=${contentId}`, '_blank')
  }, [])

  return {
    openPreview,
  }
}
