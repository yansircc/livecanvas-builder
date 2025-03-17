import { toast } from 'sonner'
import { useCallback } from 'react'
import type { ModelId } from '@/lib/models'
import { useAppStore } from '@/store/use-app-store'
import { pollTaskStatus, submitTask } from '@/utils/task-manager'
import { useConversationHistory } from './use-conversation-history'

// Interface for the form values
export interface FormValues {
  message: string
  includeContext: boolean
  context?: string
}

// Interface for the complete form data needed for API call
interface CompleteFormData {
  message: string
  model: ModelId
  apiKey: string
  context: string
}

export function useTaskSubmission(
  taskId: string | null,
  setTaskId: (id: string | null) => void,
  setTaskStatus: (status: 'processing' | 'completed' | 'error' | null) => void,
  setTaskError: (error: string | null) => void,
  setIsPolling: (isPolling: boolean) => void,
  setCurrentMessage: (message: string) => void,
  handleTaskStatusUpdate: any,
) {
  const { model, apiKey, context, addTask, updateTaskStatus, taskHistory } = useAppStore()
  const { buildConversationHistory } = useConversationHistory()

  // Process the actual submission
  const processSubmission = useCallback(
    async (data: FormValues, forceNewConversation: boolean) => {
      // 保存当前消息
      setCurrentMessage(data.message)

      // 验证输入
      if (!data.message.trim()) {
        toast.error('请输入提示词')
        return
      }

      // 准备表单数据
      const completeData: CompleteFormData = {
        message: data.message,
        model: model || 'anthropic/claude-3-7-sonnet-20250219',
        apiKey: apiKey ?? '',
        context: data.includeContext ? data.context || context || '' : '',
      }

      if (completeData.context && completeData.context.length > 10000) {
        toast.error(`背景信息必须少于 10000 个字符`)
        return
      }

      // Reset task-specific state for new tasks
      // Don't reset taskId if we're continuing a conversation and not forcing new conversation
      const isContinuingTask =
        !forceNewConversation && !!taskId && taskHistory.some((task) => task.id === taskId)

      if (!isContinuingTask) {
        setTaskId(null)
      }

      setTaskStatus(null)
      setTaskError(null)
      setIsPolling(false)

      // 构建对话历史
      const conversationHistory = buildConversationHistory()

      // 提交任务
      try {
        const taskResponse = await submitTask({
          message: completeData.message,
          context: (completeData.context || '').substring(0, 1200),
          history: conversationHistory,
          apiKey: completeData.apiKey ?? undefined,
          model: completeData.model,
        })

        // 保存任务ID
        if (taskResponse.taskId) {
          let uiTaskId = taskResponse.taskId

          if (isContinuingTask && taskId) {
            // For continuing tasks, we keep the original task ID in the UI
            uiTaskId = taskId
          } else {
            // For new tasks, we use the new task ID for both API and UI
            // Add to task history
            addTask(taskResponse.taskId, completeData.message)
          }

          // Set UI task ID
          setTaskId(uiTaskId)
          setTaskStatus('processing')
          toast.success('正在生成中，请稍候...')

          // Always update the status of the UI task ID to processing
          updateTaskStatus(
            uiTaskId,
            'processing',
            undefined, // No error
            undefined, // No output yet
          )

          // 开始轮询任务状态
          setIsPolling(true)

          void pollTaskStatus({
            taskId: taskResponse.taskId, // Use API task ID for polling
            onStatusUpdate: (status) => {
              // Map the API task ID to the UI task ID for status updates
              const mappedStatus =
                isContinuingTask && taskId ? { ...status, taskId: taskId } : status

              handleTaskStatusUpdate(mappedStatus)
            },
            maxRetries: 5, // Increase retries
            retryInterval: 3000,
            timeout: 600000, // 10分钟
          })
            .catch((error) => {
              setIsPolling(false)
              console.error('任务轮询失败:', error)
              updateTaskStatus(
                taskResponse.taskId,
                'error',
                error instanceof Error ? error.message : '未知错误',
              )
              toast.error(
                `任务状态检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
              )
            })
            .finally(() => {
              setIsPolling(false)
            })

          // Clear the input field after submission
          setCurrentMessage('')
        } else {
          toast.error('提交任务失败，请检查 Trigger.dev 配置')
        }
      } catch (error) {
        console.error('API error:', error)
        toast.error(error instanceof Error ? `错误: ${error.message}` : '生成模板时出错')
      }
    },
    [
      model,
      apiKey,
      context,
      handleTaskStatusUpdate,
      buildConversationHistory,
      addTask,
      updateTaskStatus,
      taskId,
      taskHistory,
      setCurrentMessage,
      setTaskId,
      setTaskStatus,
      setTaskError,
      setIsPolling,
    ],
  )

  return {
    processSubmission,
  }
}
