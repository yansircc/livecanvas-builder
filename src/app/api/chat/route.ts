import { generateObject, generateText } from 'ai'
import { canModelOutputStructuredData, LLM_LIST, parseModelId } from '@/lib/models'
import { extractAndParseJSON } from '@/utils/json-parser'
import { replaceWithUnsplashImages } from '@/utils/replace-with-unsplash'
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

// 定义包含 usage 信息的响应接口
interface ApiResponse extends CodeResponse {
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * 处理响应并返回格式化的结果
 * @param codeResponse 代码响应对象
 * @param usage 使用信息
 * @returns 格式化的响应
 */
function processResponse(
  codeResponse: CodeResponse,
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number },
): Response {
  // 替换图片占位符
  if (codeResponse.code) {
    codeResponse.code = replaceWithUnsplashImages(codeResponse.code)
  }

  // 创建包含 usage 信息的响应
  const responseWithUsage: ApiResponse = {
    ...codeResponse,
    usage: usage
      ? {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        }
      : undefined,
  }

  // 返回格式化的响应
  return new Response(JSON.stringify(responseWithUsage), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * 创建错误响应
 * @param message 错误消息
 * @param status HTTP状态码
 * @returns 错误响应
 */
function createErrorResponse(message: string, status = 500): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: '<!-- Error: Failed to generate valid HTML -->',
      advices: ['Try a different prompt or model'],
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
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
    return createErrorResponse(`Provider ${providerId} not found`, 400)
  }

  // Check if the selected model can output structured data
  const canOutputStructuredData = canModelOutputStructuredData(selectedModelId)

  // 构建上下文感知提示
  const contextualPrompt = buildContextualPrompt(message, context, history)

  console.debug('modelValue:', modelValue, 'canOutputStructuredData:', canOutputStructuredData)

  try {
    // 尝试使用 generateObject 或 generateText 生成响应
    return await generateResponse(
      provider.model(modelValue),
      contextualPrompt,
      canOutputStructuredData,
    )
  } catch (error) {
    console.error('Generation failed, falling back to generateText:', error)

    // 尝试使用 generateText 作为回退
    try {
      return await generateFallbackResponse(provider.model(modelValue), contextualPrompt)
    } catch (fallbackError) {
      console.error('Both generateObject and fallback failed:', fallbackError)
      return createErrorResponse('Failed to generate response')
    }
  }
}

/**
 * 构建上下文感知提示
 * @param message 用户消息
 * @param context 上下文
 * @param history 历史记录
 * @returns 上下文感知提示
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
 * 生成响应
 * @param model 模型
 * @param prompt 提示
 * @param canOutputStructuredData 是否可以输出结构化数据
 * @returns 响应
 */
async function generateResponse(
  model: any,
  prompt: string,
  canOutputStructuredData: boolean,
): Promise<Response> {
  if (canOutputStructuredData) {
    // 使用 generateObject
    const { object, usage } = await generateObject({
      model,
      schema: codeSchema,
      prompt,
    })

    return processResponse(object, usage)
  } else {
    // 使用 generateText
    console.log(`Model doesn't support structured data output, using generateText`)
    const { text, usage } = await generateText({
      model,
      prompt:
        prompt +
        "\n\nPlease respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.",
    })

    // 解析响应
    const parsedObject = extractAndParseJSON<CodeResponse>(text)

    if (parsedObject && parsedObject.code) {
      return processResponse(parsedObject, usage)
    } else {
      return createErrorResponse('Failed to parse LLM response as JSON')
    }
  }
}

/**
 * 生成回退响应
 * @param model 模型
 * @param prompt 提示
 * @returns 响应
 */
async function generateFallbackResponse(model: any, prompt: string): Promise<Response> {
  const { text, usage } = await generateText({
    model,
    prompt:
      prompt +
      "\n\nPlease respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.",
  })

  // 解析响应
  const parsedObject = extractAndParseJSON<CodeResponse>(text)

  if (parsedObject && parsedObject.code) {
    return processResponse(parsedObject, usage)
  } else {
    return createErrorResponse('Failed to parse LLM response as JSON')
  }
}
