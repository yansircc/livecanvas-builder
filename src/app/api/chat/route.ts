import { generateObject, generateText } from 'ai'
import { canModelOutputStructuredData, LLM_LIST, parseModelId } from '@/lib/models'
import { extractAndParseJSON } from '@/utils/json-parser'
import { PROMPT } from './prompt'
import { codeSchema } from './schema'
import type { CodeResponse } from './schema'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

interface ChatRequestBody {
  message: string
  context?: string
  history?: { prompt: string; response?: string }[]
  model?: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody

  // Extract message, context, history, and optional API key and model from the request
  const { message, context, history, model } = body

  // Default model if none provided
  const selectedModelId = model ?? 'anthropic/claude-3-7-sonnet-20250219'

  // Parse the model ID to get provider and model value
  const { providerId, modelValue } = parseModelId(selectedModelId)

  // Get the provider from LLM_LIST
  const provider = LLM_LIST[providerId]

  if (!provider) {
    return new Response(JSON.stringify({ error: `Provider ${providerId} not found` }), {
      status: 400,
    })
  }

  // Check if the selected model can output structured data
  const canOutputStructuredData = canModelOutputStructuredData(selectedModelId)

  // Create a context-aware prompt that includes conversation history
  let contextualPrompt = PROMPT

  // Add user context if available
  if (context?.trim()) {
    contextualPrompt += `\n\n### User Context:\n${context}`
  }

  // Add conversation history if available
  if (history && history.length > 0) {
    contextualPrompt += '\n\n### Previous Conversation Context:'
    history.forEach((item: { prompt: string; response?: string }, index: number) => {
      contextualPrompt += `\n\nUser Request ${index + 1}: ${item.prompt}`
      if (item.response) {
        contextualPrompt += `\n\nYour Response ${index + 1}: You generated the following HTML code:\n\`\`\`html\n${item.response}\n\`\`\``
      }
    })
    contextualPrompt += '\n\n### Current Request:'
  }

  // Add the current message
  contextualPrompt += `\n${message}`

  console.debug('modelValue:', modelValue, 'canOutputStructuredData:', canOutputStructuredData)

  try {
    // If the model can output structured data, use generateObject
    if (canOutputStructuredData) {
      // First try with generateObject
      const { object } = await generateObject({
        model: provider.model(modelValue),
        schema: codeSchema,
        prompt: contextualPrompt,
      })

      // Return the object as a proper Response
      return new Response(JSON.stringify(object), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      // For models that can't output structured data, use generateText directly
      console.log(
        `Model ${selectedModelId} doesn't support structured data output, using generateText`,
      )
      const { text } = await generateText({
        model: provider.model(modelValue),
        prompt:
          contextualPrompt +
          "\n\nPlease respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.",
      })

      // Extract and parse JSON from the text response
      const parsedObject = extractAndParseJSON<CodeResponse>(text)

      if (parsedObject && parsedObject.code) {
        return new Response(JSON.stringify(parsedObject), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // If parsing fails, return an error
        return new Response(
          JSON.stringify({
            error: 'Failed to parse LLM response as JSON',
            code: '<!-- Error: Failed to generate valid HTML -->',
            advices: ['Try a different prompt or model'],
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
      }
    }
  } catch (error) {
    console.error('Generation failed, falling back to generateText:', error)

    // If generateObject fails or for models that don't support structured data, fall back to generateText
    try {
      const { text } = await generateText({
        model: provider.model(modelValue),
        prompt:
          contextualPrompt +
          "\n\nPlease respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.",
      })

      // Extract and parse JSON from the text response
      const parsedObject = extractAndParseJSON<CodeResponse>(text)

      if (parsedObject && parsedObject.code) {
        return new Response(JSON.stringify(parsedObject), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // If parsing fails, return an error
        return new Response(
          JSON.stringify({
            error: 'Failed to parse LLM response as JSON',
            code: '<!-- Error: Failed to generate valid HTML -->',
            advices: ['Try a different prompt or model'],
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
      }
    } catch (fallbackError) {
      console.error('Both generateObject and fallback failed:', fallbackError)

      // Return a user-friendly error
      return new Response(
        JSON.stringify({
          error: 'Failed to generate response',
          code: '<!-- Error: Failed to generate valid HTML -->',
          advices: ['Try a different prompt or model'],
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
  }
}
