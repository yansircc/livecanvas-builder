import { tasks } from '@trigger.dev/sdk/v3'
import { getServerSession } from '@/lib/auth-server'
import { chatGenerationTask } from '@/trigger/chat-generation'

// Allow streaming responses up to 1 minutes
export const maxDuration = 60
interface ChatRequestBody {
  message: string
  context?: string
  history?: { prompt: string; response?: string }[]
  model?: string
  callbackUrl?: string // URL to call back with results (for long-running tasks)
  // 精准模式选项，会额外消耗更多token来获取更精准的UI文档
  precisionMode?: boolean
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
    // 获取会话，用于获取用户数据（不负责验证了）
    // 注意：中间件已经进行了身份验证，所以如果代码执行到这里，用户一定是已验证的
    const session = await getServerSession()
    if (!session) {
      // 理论上不应该发生，因为中间件已经拦截了未认证请求
      // 加上以防万一
      return createErrorResponse('Unauthorized', 401)
    }

    // 获取用户数据用于任务标记
    const { user } = session

    const body = (await req.json()) as ChatRequestBody

    // Extract message, context, history, and optional API key and model from the request
    const { message, context, history, model, callbackUrl, precisionMode } = body

    // Default model if none provided
    const selectedModelId = model ?? 'openai/gpt-4o-mini'

    // 所有请求都发送到 Trigger.dev 处理
    try {
      // 触发 Trigger.dev 任务
      const handle = await tasks.trigger(
        chatGenerationTask.id,
        {
          message,
          context,
          history,
          model: selectedModelId,
          callbackUrl,
          precisionMode,
        },
        {
          tags: [user.email],
        },
      )

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
