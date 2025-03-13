/**
 * Utility functions for checking the status of long-running tasks
 */

/**
 * Task status response interface
 */
export interface TaskStatusResponse {
  taskId: string
  status: 'processing' | 'completed' | 'error'
  output?: {
    code: string
    advices: string[]
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }
  error?: any
  startedAt?: string
  completedAt?: string
  originalStatus?: string // 原始状态，用于调试
}

/**
 * Check the status of a task
 * @param taskId The ID of the task to check
 * @returns The task status response
 */
export async function checkTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  try {
    const response = await fetch(`/api/task-status?taskId=${encodeURIComponent(taskId)}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error checking task status:', errorData)

      // 如果是 404 错误，可能是任务还没有在 Trigger.dev 系统中注册
      if (response.status === 404) {
        return {
          taskId,
          status: 'processing',
          error: 'Task not found yet, it might still be initializing',
        }
      }

      throw new Error(`Failed to check task status: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error in checkTaskStatus:', error)
    // 返回一个默认响应，表示我们无法获取状态但假设任务仍在处理中
    return {
      taskId,
      status: 'processing',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Poll for task status until it's completed or failed
 * @param taskId The ID of the task to poll
 * @param options Polling options
 * @returns The final task status
 */
export async function pollTaskStatus(
  taskId: string,
  options: {
    interval?: number // Polling interval in milliseconds (default: 2000)
    timeout?: number // Maximum time to poll in milliseconds (default: 5 minutes)
    maxRetries?: number // Maximum number of consecutive errors before giving up (default: 3)
    onUpdate?: (status: TaskStatusResponse) => void // Callback for status updates
  } = {},
): Promise<TaskStatusResponse> {
  const interval = options.interval || 2000
  const timeout = options.timeout || 5 * 60 * 1000
  const maxRetries = options.maxRetries || 3
  const startTime = Date.now()
  let consecutiveErrors = 0

  // Function to check status once
  const checkOnce = async (): Promise<TaskStatusResponse> => {
    try {
      const status = await checkTaskStatus(taskId)

      // 重置连续错误计数
      consecutiveErrors = 0

      // Call the update callback if provided
      if (options.onUpdate) {
        options.onUpdate(status)
      }

      return status
    } catch (error) {
      // 增加连续错误计数
      consecutiveErrors++

      if (consecutiveErrors > maxRetries) {
        throw new Error(`Failed to check task status after ${maxRetries} consecutive attempts`)
      }

      console.warn(
        `Error checking task status (attempt ${consecutiveErrors}/${maxRetries}):`,
        error,
      )

      // 返回一个默认响应，表示我们无法获取状态但假设任务仍在处理中
      return {
        taskId,
        status: 'processing',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Initial check
  let status = await checkOnce()

  // If already completed or failed, return immediately
  if (status.status === 'completed' || status.status === 'error') {
    return status
  }

  // Otherwise, poll until completed, failed, or timed out
  return new Promise<TaskStatusResponse>((resolve, reject) => {
    const poll = () => {
      // Use a regular function instead of an async function for setTimeout
      void (async () => {
        try {
          // Check if we've exceeded the timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Polling timed out'))
            return
          }

          // Check the status
          status = await checkOnce()

          // If completed or failed, resolve
          if (status.status === 'completed' || status.status === 'error') {
            resolve(status)
            return
          }

          // Otherwise, schedule the next poll
          setTimeout(poll, interval)
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      })()
    }

    // Start polling
    setTimeout(poll, interval)
  })
}
