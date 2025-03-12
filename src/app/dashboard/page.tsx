'use client'

import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { CodeOutput } from '@/components/canvas/code-output'
import { EnhancedForm, MAX_CONTEXT_LENGTH } from '@/components/canvas/enhanced-form'
import { TokenUsage } from '@/components/canvas/token-usage'
import Footer from '@/components/footer'
import type { ModelId } from '@/lib/models'
import { useAppStore } from '@/store/use-app-store'
import { processHtml } from '@/utils/process-html'

interface CodeResponse {
  code: string
  advices?: string[] | null
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface FormValues {
  message: string
  model: ModelId
  apiKey: string
  context: string
}

function openPreview(html: string) {
  const contentId = Date.now().toString()
  localStorage.setItem(`preview_content_${contentId}`, html)
  window.open(`/preview?id=${contentId}`, '_blank')
}

export default function Page() {
  const {
    apiKey,
    model,
    context,
    isLoading,
    code,
    advices,
    validationResult,
    versions,
    currentVersionIndex,
    usage,
    setState,
    addVersion,
    resetState,
  } = useAppStore()

  // Add a state variable to store the current message
  const [currentMessage, setCurrentMessage] = useState('')

  // Clear version history when the page loads
  useEffect(() => {
    resetState({ keepUserSettings: true, keepVersions: false })
  }, [resetState])

  // Reset current message when code is reset
  useEffect(() => {
    if (code === null) {
      setCurrentMessage('')
    }
  }, [code])

  // Render template to HTML
  const renderTemplateToHtml = useCallback(
    (htmlCode: string) => {
      try {
        // Process HTML to replace Lucide icons with SVGs where possible
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
        return null
      }
    },
    [setState],
  )

  const handleSubmit = async (data: FormValues) => {
    // Validate inputs
    if (!data.message.trim()) {
      toast.error('请输入提示')
      return
    }

    if (data.context && data.context.length > MAX_CONTEXT_LENGTH) {
      toast.error(`上下文必须小于${MAX_CONTEXT_LENGTH}个字符`)
      return
    }

    // Store the current message for later use
    setCurrentMessage(data.message)

    // Reset state but keep user settings and versions
    resetState({ keepUserSettings: true, keepVersions: true })
    setState('isLoading', true)

    // Build conversation history based on the current version
    const conversationHistory = []

    // If we're on a specific version, get only the most recent AI response
    if (currentVersionIndex >= 0 && versions.length > 0) {
      // Get the current version (most recent AI response)
      const currentVersion = versions[currentVersionIndex]

      // Only add the most recent AI response to the history
      if (currentVersion) {
        conversationHistory.push({
          prompt: currentVersion.prompt,
          response: currentVersion.code,
        })
      }

      // Log the optimized context for debugging
      console.log('优化上下文: 只发送最新的AI响应')
    }

    try {
      // Make a direct fetch request to the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          context: (data.context || context || '').substring(0, 1200),
          history: conversationHistory,
          apiKey: data.apiKey ?? apiKey ?? undefined,
          model: data.model ?? model,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? `API request failed with status ${response.status}`)
      }

      // Parse the response as JSON
      const object: CodeResponse = (await response.json()) as CodeResponse

      // Process the code
      if (object.code) {
        setState('code', object.code)

        // Handle advices with robust type checking and conversion
        if (object.advices) {
          let processedAdvices: string[] = []
          if (Array.isArray(object.advices)) {
            processedAdvices = object.advices
              .filter((advice) => advice !== null && advice !== undefined)
              .map((advice) => (typeof advice === 'string' ? advice : String(advice)))
            setState('advices', processedAdvices)
          } else {
            // Fallback for unexpected format
            setState('advices', [String(object.advices)])
          }
        } else {
          setState('advices', [])
        }

        // Save token usage information
        if (object.usage) {
          setState('usage', object.usage)
        }

        // Process the HTML
        const processedHtml = renderTemplateToHtml(object.code)

        // Add a new version with the current form data
        const formData = {
          message: currentMessage,
          model: model,
          apiKey: apiKey,
          context: context,
        }

        addVersion(currentMessage, formData)

        // Open preview with the current version's HTML
        if (processedHtml) {
          openPreview(processedHtml)
        }
      }
    } catch (error) {
      console.error('API error:', error)
      toast.error(error instanceof Error ? error.message : '生成模板时发生错误')
    } finally {
      setState('isLoading', false)
    }
  }

  const handleAdviceClick = (advice: string) => {
    // This is now just a placeholder since the form handles it internally
    console.log('Advice clicked:', advice)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto h-full px-4">
          <div className="grid h-full grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left: Form Panel */}
            <div>
              <EnhancedForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                advices={advices}
                onAdviceClick={handleAdviceClick}
                initialMessage={currentMessage}
              />
              {usage && <TokenUsage usage={usage} modelId={model} />}
            </div>

            {/* Right: Output Panel */}
            <div className="h-full">
              <CodeOutput
                code={code ?? ''}
                validationResult={validationResult}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
