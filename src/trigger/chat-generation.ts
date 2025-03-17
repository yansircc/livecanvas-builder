import { logger, task } from '@trigger.dev/sdk/v3'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { PROMPT } from '@/app/api/chat/prompt'
import { codeSchema } from '@/app/api/chat/schema'
import type { CodeResponse } from '@/app/api/chat/schema'
import { canModelOutputStructuredData, LLM_LIST, parseModelId } from '@/lib/models'
import { extractAndParseJSON } from '@/utils/json-parser'
import { replaceWithUnsplashImages } from '@/utils/replace-with-unsplash'

// Define the input schema for the task
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chatInputSchema = z.object({
  message: z.string(),
  context: z.string().optional(),
  history: z
    .array(
      z.object({
        prompt: z.string(),
        response: z.string().optional(),
      }),
    )
    .optional(),
  model: z.string().optional(),
  callbackUrl: z.string().optional(),
})

// Define the task using the task function from Trigger.dev
export const chatGenerationTask = task({
  id: 'chat-generation-task',
  // Set a maximum duration for the task
  maxDuration: 300, // 5 minutes
  run: async (payload: z.infer<typeof chatInputSchema>) => {
    logger.log('Starting chat generation task', { payload })

    const { message, context, history, model } = payload

    // Default model if none provided
    const selectedModelId = model ?? 'anthropic/claude-3-7-sonnet-20250219'

    // Parse the model ID to get provider and model value
    const { providerId, modelValue } = parseModelId(selectedModelId)

    // Get the provider from LLM_LIST
    const provider = LLM_LIST[providerId]

    if (!provider) {
      throw new Error(`Provider ${providerId} not found`)
    }

    // Check if the selected model can output structured data
    const canOutputStructuredData = canModelOutputStructuredData(selectedModelId)

    // Build contextual prompt
    const contextualPrompt = buildContextualPrompt(message, context, history)

    logger.log('Using model', { modelValue, canOutputStructuredData })

    try {
      // Generate response without retry (trigger.dev handles retries)
      const response = await generateResponse(
        provider.model(modelValue),
        contextualPrompt,
        canOutputStructuredData,
      )

      logger.log('Generation successful', { responseLength: response.code.length })

      return response
    } catch (error) {
      logger.error('Generation failed', { error })
      throw error
    }
  },
})

/**
 * Build contextual prompt
 */
function buildContextualPrompt(
  message: string,
  context?: string,
  history?: { prompt: string; response?: string }[],
): string {
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

  return contextualPrompt
}

/**
 * Generate response without retry (trigger.dev handles retries)
 */
async function generateResponse(
  model: any,
  prompt: string,
  canOutputStructuredData: boolean,
): Promise<
  CodeResponse & { usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }
> {
  if (canOutputStructuredData) {
    // Use generateObject
    const { object, usage } = await generateObject({
      model,
      schema: codeSchema,
      prompt,
    })

    logger.debug('Generated object', { object })

    // Replace image placeholders
    if (object.code) {
      object.code = replaceWithUnsplashImages(object.code)
    }

    return {
      ...object,
      usage: usage
        ? {
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
          }
        : undefined,
    }
  } else {
    // Use generateText
    logger.log(`Model doesn't support structured data output, using generateText`)
    const { text, usage } = await generateText({
      model,
      prompt:
        prompt +
        "\n\nPlease respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.",
    })

    logger.debug('Generated text', { text })

    // Parse response
    const parsedObject = extractAndParseJSON<CodeResponse>(text)

    if (parsedObject && parsedObject.code) {
      // Replace image placeholders
      parsedObject.code = replaceWithUnsplashImages(parsedObject.code)

      return {
        ...parsedObject,
        usage: usage
          ? {
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              totalTokens: usage.totalTokens,
            }
          : undefined,
      }
    } else {
      throw new Error('Failed to parse LLM response as JSON')
    }
  }
}
