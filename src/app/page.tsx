'use client'

import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { CodeOutput } from '@/components/canvas/code-output'
import { EnhancedForm, MAX_CONTEXT_LENGTH } from '@/components/canvas/enhanced-form'
import { ThemeToggle } from '@/components/theme-toggle'
import type { ModelId } from '@/lib/models'
import { useAppStore } from '@/store/use-app-store'
import { processHtml } from '@/utils/process-html'

interface CodeResponse {
  code: string
  advices?: string[] | null
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

  // Add a debug log to check if the persistence is working
  useEffect(() => {
    console.log('Stored values:', { apiKey, model, context })
  }, [apiKey, model, context])

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
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <h1 className="text-primary text-2xl font-bold">LiveCanvas Builder</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container mx-auto h-full">
          <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: Form Panel */}
            <div>
              <EnhancedForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                advices={advices}
                onAdviceClick={handleAdviceClick}
                initialMessage={currentMessage}
              />
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
    </div>
  )
}
