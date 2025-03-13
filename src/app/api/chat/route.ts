import { tasks } from '@trigger.dev/sdk/v3'
import { chatGenerationTask } from '@/trigger/chat-generation'

// Allow streaming responses up to 120 seconds
export const maxDuration = 120

interface ChatRequestBody {
  message: string
  context?: string
  history?: { prompt: string; response?: string }[]
  model?: string
  callbackUrl?: string // URL to call back with results (for long-running tasks)
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
  try {
    const body = (await req.json()) as ChatRequestBody

    // Extract message, context, history, and optional API key and model from the request
    const { message, context, history, model, callbackUrl } = body

    // Default model if none provided
    const selectedModelId = model ?? 'openai/gpt-4o-mini'

    // 所有请求都发送到 Trigger.dev 处理
    try {
      // 触发 Trigger.dev 任务
      const handle = await tasks.trigger(chatGenerationTask.id, {
        message,
        context,
        history,
        model: selectedModelId,
        callbackUrl,
      })

      // 返回任务已开始的响应
      return new Response(
        JSON.stringify({
          taskId: handle.id,
          status: 'processing',
          code: '<!-- Processing your request, please check back later -->',
          advices: ['Your request is being processed', '任务已经开始处理', '请稍后查看结果'],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    } catch (error) {
      console.error('Failed to trigger task:', error)
      return createErrorResponse('Failed to start processing task', 500)
    }
  } catch (error) {
    console.error('Error parsing request:', error)
    return createErrorResponse('Invalid request format', 400)
  }
}
