import { useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useHtmlProcessor } from './use-html-processor'
import { usePreview } from './use-preview'

export function useTaskOutput() {
  const { setState, addVersion, model, apiKey, context } = useAppStore()
  const { renderTemplateToHtml } = useHtmlProcessor()
  const { openPreview } = usePreview()

  // Process task output
  const processTaskOutput = useCallback(
    (output: any, currentMessage: string) => {
      if (!output?.code) return

      // 设置代码
      setState('code', output.code)

      // 处理建议
      if (output.advices) {
        const processedAdvices = Array.isArray(output.advices)
          ? output.advices
              .filter(Boolean)
              .map((advice: unknown) => (typeof advice === 'string' ? advice : String(advice)))
          : [String(output.advices)]

        setState('advices', processedAdvices)
      } else {
        setState('advices', [])
      }

      // 保存 token 使用信息
      if (output.usage) {
        setState('usage', output.usage)
      }

      // 处理 HTML
      const processedHtml = renderTemplateToHtml(output.code)

      // 添加新版本
      const formData = {
        message: currentMessage,
        model,
        apiKey,
        context,
      }

      addVersion(currentMessage, formData)

      // 打开预览
      if (processedHtml) {
        openPreview(processedHtml)
      }
    },
    [setState, renderTemplateToHtml, model, apiKey, context, addVersion, openPreview],
  )

  return {
    processTaskOutput,
  }
}
