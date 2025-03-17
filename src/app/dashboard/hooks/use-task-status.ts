import { toast } from 'sonner'
import { useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { type TaskResponse } from '@/utils/task-manager'

export function useTaskStatus() {
  const { updateTaskStatus } = useAppStore()

  // Handle task status update
  const handleTaskStatusUpdate = useCallback(
    (
      status: TaskResponse,
      taskId: string | null,
      setTaskStatus: (status: 'processing' | 'completed' | 'error' | null) => void,
      setTaskError: (error: string | null) => void,
      processTaskOutput: (output: any) => void,
    ) => {
      const statusTaskId = status.taskId
      console.log('任务状态更新:', status)

      // Only update the current task status if it matches the active task
      if (statusTaskId === taskId) {
        setTaskStatus(status.status)
      }

      // Update task status in history with output if available
      updateTaskStatus(
        statusTaskId,
        status.status,
        status.error
          ? typeof status.error === 'string'
            ? status.error
            : JSON.stringify(status.error)
          : undefined,
        status.output
          ? {
              code: status.output.code,
              advices: status.output.advices
                ? Array.isArray(status.output.advices)
                  ? status.output.advices
                  : [String(status.output.advices)]
                : [],
              usage: status.output.usage,
            }
          : undefined,
      )

      if (status.error) {
        if (statusTaskId === taskId) {
          setTaskError(
            typeof status.error === 'string' ? status.error : JSON.stringify(status.error),
          )
        }

        // Show error toast with the actual error message
        if (status.status === 'error') {
          const errorMessage =
            typeof status.error === 'string'
              ? status.error
              : status.error?.message || '生成失败，请检查 Trigger.dev 配置'

          // 显示特定的取消消息
          if (status.originalStatus === 'CANCELED') {
            toast.error('任务已被取消')
          } else {
            toast.error(`生成失败: ${errorMessage}`)
          }
        }
      }

      // 如果任务完成，处理输出
      if (status.status === 'completed' && status.output) {
        processTaskOutput(status.output)
      }
    },
    [updateTaskStatus],
  )

  return {
    handleTaskStatusUpdate,
  }
}
