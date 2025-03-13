import { toast } from 'sonner'
import type { ModelId } from '@/lib/models'

// 定义任务状态类型
export type TaskStatus = 'processing' | 'completed' | 'error'

// 定义任务输出接口
export interface TaskOutput {
  code: string
  advices?: string[] | null
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// 定义任务响应接口
export interface TaskResponse {
  taskId: string
  status: TaskStatus
  output?: TaskOutput
  error?: any
  startedAt?: string
  completedAt?: string
  originalStatus?: string
}

// 定义对话历史记录项接口
export interface ConversationHistoryItem {
  prompt: string
  response: string
}

// 定义任务提交参数接口
export interface TaskSubmitParams {
  message: string
  context?: string
  history?: ConversationHistoryItem[]
  apiKey?: string
  model: ModelId
}

// 定义任务状态检查参数接口
export interface TaskStatusCheckParams {
  taskId: string | null | undefined
  onStatusUpdate?: (status: TaskResponse) => void
  maxRetries?: number
  retryInterval?: number
  timeout?: number
}

// 定义轮询选项的默认值
const DEFAULT_POLL_OPTIONS = {
  maxRetries: 3,
  retryInterval: 3000,
  timeout: 600000, // 10分钟超时
}

/**
 * 提交任务到 API
 * @param params 任务参数
 * @returns 任务响应，包含任务ID
 */
export async function submitTask(params: TaskSubmitParams): Promise<TaskResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: params.message,
        context: params.context || '',
        history: params.history || [],
        apiKey: params.apiKey,
        model: params.model,
      }),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      throw new Error(errorData.error ?? `API请求失败，状态码 ${response.status}`)
    }

    return (await response.json()) as TaskResponse
  } catch (error) {
    console.error('提交任务失败:', error)
    throw error
  }
}

/**
 * 检查任务状态
 * @param taskId 任务ID
 * @returns 任务状态响应
 */
export async function checkTaskStatus(taskId: string): Promise<TaskResponse> {
  try {
    const response = await fetch(`/api/task-status?taskId=${taskId}`)

    if (!response.ok) {
      // 如果是404错误，可能是任务还没有开始处理
      if (response.status === 404) {
        return {
          taskId,
          status: 'processing',
          error: '任务尚未开始处理',
        }
      }

      const errorData = (await response.json().catch(() => ({}))) as { error?: string }
      console.error('检查任务状态失败:', errorData)
      throw new Error(errorData.error ?? `获取任务状态失败，状态码 ${response.status}`)
    }

    return (await response.json()) as TaskResponse
  } catch (error) {
    console.error('检查任务状态出错:', error)
    // 返回一个默认响应，表示任务仍在处理中
    return {
      taskId,
      status: 'processing',
      error: error instanceof Error ? error.message : '检查任务状态时出错',
    }
  }
}

/**
 * 轮询任务状态直到完成或出错
 * @param params 轮询参数
 * @returns Promise，解析为最终的任务状态
 */
export function pollTaskStatus({
  taskId,
  onStatusUpdate,
  maxRetries = DEFAULT_POLL_OPTIONS.maxRetries,
  retryInterval = DEFAULT_POLL_OPTIONS.retryInterval,
  timeout = DEFAULT_POLL_OPTIONS.timeout,
}: TaskStatusCheckParams): Promise<TaskResponse> {
  return new Promise((resolve, reject) => {
    // 如果 taskId 为空，则立即拒绝 Promise
    if (!taskId) {
      reject(new Error('任务ID不能为空'))
      return
    }

    let consecutiveErrors = 0
    const startTime = Date.now()

    // 创建一个函数来检查状态
    const checkStatus = async () => {
      // 检查是否超时
      if (Date.now() - startTime > timeout) {
        reject(new Error('任务轮询超时'))
        return
      }

      try {
        const status = await checkTaskStatus(taskId)

        // 重置连续错误计数
        consecutiveErrors = 0

        // 如果提供了状态更新回调，则调用它
        if (onStatusUpdate) {
          onStatusUpdate(status)
        }

        // 如果任务已完成或出错，则解析Promise
        if (status.status === 'completed' || status.status === 'error') {
          resolve(status)
          return
        }

        // 否则，继续轮询
        setTimeout(() => {
          void checkStatus()
        }, retryInterval)
      } catch (error) {
        consecutiveErrors++
        console.error(`任务状态检查失败 (${consecutiveErrors}/${maxRetries}):`, error)

        // 如果连续错误次数超过最大重试次数，则拒绝Promise
        if (consecutiveErrors >= maxRetries) {
          reject(new Error('检查任务状态失败，已达到最大重试次数'))
          return
        }

        // 否则，继续轮询
        setTimeout(() => {
          void checkStatus()
        }, retryInterval)
      }
    }

    // 开始轮询
    void checkStatus()
  })
}

/**
 * 手动检查任务状态（用于UI中的"检查状态"按钮）
 * @param taskId 任务ID
 * @returns 任务状态响应
 */
export async function manualCheckTaskStatus(taskId: string): Promise<TaskResponse> {
  try {
    toast.info('正在检查任务状态...')
    const status = await checkTaskStatus(taskId)

    if (status.status === 'completed') {
      toast.success('任务已完成！')
    } else if (status.status === 'error') {
      toast.error('任务出错')
    } else {
      toast.info('任务仍在处理中')
    }

    return status
  } catch (error) {
    console.error('手动检查任务状态失败:', error)
    toast.error('检查任务状态失败')
    throw error
  }
}
