'use client'

import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { CodeOutput } from '@/components/canvas/code-output'
import { EnhancedForm, MAX_CONTEXT_LENGTH } from '@/components/canvas/enhanced-form'
import Header from '@/components/header'
import Footer from '@/components/footer'
import type { ModelId } from '@/lib/models'
import { useAppStore } from '@/store/use-app-store'
import { processHtml } from '@/utils/process-html'
import { getModelPrice } from '@/lib/models'

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

// 计算成本的函数，汇率固定为 7.3
function calculateCost(
  usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  modelId: ModelId
): { usd: number; cny: number } | undefined {
  const price = getModelPrice(modelId)
  if (!price || !usage) return undefined

  // 价格是按每百万 token 计算的，所以需要除以 1,000,000
  const inputCostUSD = (usage.promptTokens / 1000000) * price.input
  const outputCostUSD = (usage.completionTokens / 1000000) * price.output
  const totalCostUSD = inputCostUSD + outputCostUSD

  // 汇率固定为 7.3
  const exchangeRate = 7.3
  const totalCostCNY = totalCostUSD * exchangeRate

  return {
    usd: totalCostUSD,
    cny: totalCostCNY,
  }
}

// Token usage display component
function TokenUsage({ 
  usage,
  modelId
}: { 
  usage?: { 
    promptTokens: number
    completionTokens: number
    totalTokens: number 
  },
  modelId: ModelId
}) {
  if (!usage) return null;
  
  const cost = calculateCost(usage, modelId)
  
  return (
    <div className="mt-2 p-3 bg-zinc-100 rounded-lg dark:bg-zinc-800">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">Token 使用情况</h3>
      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
        <p>总计: {usage.totalTokens.toLocaleString()} tokens</p>
        <p>提示: {usage.promptTokens.toLocaleString()} tokens</p>
        <p>补全: {usage.completionTokens.toLocaleString()} tokens</p>
        {cost && (
          <p className="pt-1 border-t border-zinc-200 dark:border-zinc-700 mt-1">
            估计费用: {cost.cny.toFixed(4)} 元 (${cost.usd.toFixed(4)})
          </p>
        )}
      </div>
    </div>
  );
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
          errors: ['Failed to process HTML'],
        })
        return null
      }
    },
    [setState],
  )

  const handleSubmit = async (data: FormValues) => {
    // Validate inputs
    if (!data.message.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (data.context && data.context.length > MAX_CONTEXT_LENGTH) {
      toast.error(`Context must be ${MAX_CONTEXT_LENGTH} characters or less`)
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
      console.log('Optimized context: Only sending the most recent AI response')
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
      toast.error(
        error instanceof Error ? error.message : 'An error occurred while generating the template',
      )
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
      {/* Header */}
      <Header />

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
