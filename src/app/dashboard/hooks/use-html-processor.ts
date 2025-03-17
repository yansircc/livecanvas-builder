import { useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { processHtml } from '@/utils/process-html'

export function useHtmlProcessor() {
  const { setState } = useAppStore()

  // Render HTML template
  const renderTemplateToHtml = useCallback(
    (htmlCode: string): string => {
      try {
        try {
          const processedHtmlWithIcons = processHtml(htmlCode)
          setState('processedHtml', processedHtmlWithIcons)
          return processedHtmlWithIcons
        } catch (iconError) {
          console.error('Error processing icons:', iconError)
          setState('processedHtml', htmlCode)
          return htmlCode
        }
      } catch (error) {
        console.error('Error displaying HTML:', error)
        setState('validationResult', {
          valid: false,
          errors: ['处理HTML失败'],
        })
        return ''
      }
    },
    [setState],
  )

  return {
    renderTemplateToHtml,
  }
}
