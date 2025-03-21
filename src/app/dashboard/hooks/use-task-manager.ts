import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useDialog } from './use-dialog'
import { useHtmlProcessor } from './use-html-processor'
import { useTaskOutput } from './use-task-output'
import { useTaskStatus } from './use-task-status'
import { useTaskSubmission, type FormValues } from './use-task-submission'

export function useTaskManager() {
  const { resetState, taskHistory, setState, isLoading, addTask, updateTaskStatus, deleteTask } =
    useAppStore()

  // Local state
  const [currentMessage, setCurrentMessage] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<'processing' | 'completed' | 'error' | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null)

  // Check functions
  // Check if the current task (by ID) is processing
  const isFormDisabled = useCallback(() => {
    if (!taskId) return false
    const currentTask = taskHistory.find((task) => task.id === taskId)
    return currentTask?.status === 'processing'
  }, [taskId, taskHistory])

  // Check if current task is processing
  const isCurrentTaskProcessing = useCallback(() => {
    if (!taskId) return false
    const currentTask = taskHistory.find((task) => task.id === taskId)
    return currentTask?.status === 'processing'
  }, [taskId, taskHistory])

  // Check if any task is processing (used to disable form)
  const isAnyTaskProcessing = useCallback(() => {
    return taskHistory.some((task) => task.status === 'processing')
  }, [taskHistory])

  // Import hooks
  const { renderTemplateToHtml } = useHtmlProcessor()
  const { processTaskOutput: processOutput } = useTaskOutput()

  // Process task output with current message
  const processTaskOutput = useCallback(
    (output: any) => {
      processOutput(output, currentMessage)
    },
    [processOutput, currentMessage],
  )

  // Task status management
  const { handleTaskStatusUpdate: handleTaskUpdate } = useTaskStatus()

  // Create a wrapped version of handleTaskStatusUpdate that includes our local state
  const handleTaskStatusUpdate = useCallback(
    (status: any) => {
      handleTaskUpdate(status, taskId, setTaskStatus, setTaskError, processTaskOutput)
    },
    [handleTaskUpdate, taskId, processTaskOutput],
  )

  // Task submission
  const { processSubmission } = useTaskSubmission(
    taskId,
    setTaskId,
    setTaskStatus,
    setTaskError,
    setIsPolling,
    setCurrentMessage,
    handleTaskStatusUpdate,
  )

  // Dialog management
  // We keep this only for compatibility, but won't use it for task processing
  const { showDialog, setShowDialog, pendingSubmission, handleDialogConfirm, handleDialogCancel } =
    useDialog(processSubmission)

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: FormValues) => {
      // If already loading or the current task is processing, prevent submission
      if (isLoading || isFormDisabled()) {
        return
      }

      // If we have a current task ID, update its status to 'processing'
      if (taskId) {
        updateTaskStatus(taskId, 'processing')
      }

      // Process submission directly - no more dialog
      void processSubmission(data, false)
    },
    [processSubmission, isLoading, isFormDisabled, taskId, updateTaskStatus],
  )

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    // Reset state while keeping task history
    resetState({ keepUserSettings: true, keepVersions: true, keepTaskHistory: true })

    // Create a new task
    const newTaskId = Date.now().toString()
    addTask(newTaskId, '')

    // Reset local state and set to new task
    setCurrentMessage('')
    setTaskId(newTaskId)
    setTaskStatus(null)
    setTaskError(null)
  }, [resetState, addTask])

  // Handle task click
  const handleTaskClick = useCallback(
    (clickedTaskId: string) => {
      // Find the clicked task in the history
      const clickedTask = taskHistory.find((task) => task.id === clickedTaskId)

      if (clickedTask) {
        // Set the current task ID
        setTaskId(clickedTaskId)

        // Set the current message to the task message
        setCurrentMessage(clickedTask.message || '')

        // 总是先清空当前状态
        setState('code', null)
        setState('advices', [])
        setState('processedHtml', '')
        setState('usage', undefined)

        // 如果任务已完成，恢复其数据
        if (clickedTask.status === 'completed') {
          // 首先检查taskHistory中的数据
          if (clickedTask.code) {
            setState('code', clickedTask.code)
          }

          if (clickedTask.advices && clickedTask.advices.length > 0) {
            setState('advices', clickedTask.advices)
          }

          if (clickedTask.processedHtml) {
            setState('processedHtml', clickedTask.processedHtml)
          } else if (clickedTask.code) {
            // 如果没有处理过的HTML但有代码，则现在处理
            const processedHtml = renderTemplateToHtml(clickedTask.code)
            if (processedHtml) {
              setState('processedHtml', processedHtml)
            }
          }

          if (clickedTask.usage) {
            setState('usage', clickedTask.usage)
          }
        }

        console.log('切换到会话:', clickedTask.message)
      }
    },
    [taskHistory, setState, setTaskId, setCurrentMessage, renderTemplateToHtml],
  )

  // 处理任务删除逻辑
  const handleTaskDelete = useCallback((id: string) => {
    // 设置待删除的任务ID并打开确认对话框
    setPendingDeleteTaskId(id)
    setDeleteDialogOpen(true)
  }, [])

  // 取消删除任务
  const cancelDeleteTask = useCallback(() => {
    setDeleteDialogOpen(false)
    setPendingDeleteTaskId(null)
  }, [])

  // 确认删除任务
  const confirmDeleteTask = useCallback(() => {
    if (!pendingDeleteTaskId) return

    // 保存当前是否是删除当前选中任务的标记
    const isDeletingCurrentTask = pendingDeleteTaskId === taskId

    // 执行删除
    const success = deleteTask(pendingDeleteTaskId)

    // 关闭对话框并重置待删除ID
    setDeleteDialogOpen(false)
    setPendingDeleteTaskId(null)

    if (success && isDeletingCurrentTask) {
      // 如果删除的是当前选中的任务，需要切换到新的任务
      const remainingTasks = taskHistory.filter((task) => task.id !== pendingDeleteTaskId)

      if (remainingTasks.length > 0) {
        // 切换到最近的任务
        const latestTask = remainingTasks[remainingTasks.length - 1]
        if (latestTask) {
          setTaskId(latestTask.id)
          setCurrentMessage(latestTask.message || '')

          // 如果是已完成的任务，恢复其状态
          if (latestTask.status === 'completed') {
            if (latestTask.code) setState('code', latestTask.code)
            if (latestTask.advices) setState('advices', latestTask.advices)
            if (latestTask.processedHtml) setState('processedHtml', latestTask.processedHtml)
            if (latestTask.usage) setState('usage', latestTask.usage)
          } else {
            // 对于未完成的任务，清空状态
            setState('code', null)
            setState('advices', [])
            setState('processedHtml', '')
            setState('usage', undefined)
          }
        }
      } else {
        // 如果没有剩余任务，创建一个新任务
        handleNewConversation()
      }
    }
  }, [
    pendingDeleteTaskId,
    taskId,
    deleteTask,
    taskHistory,
    setState,
    handleNewConversation,
    setCurrentMessage,
  ])

  // Create initial task if none exists
  useEffect(() => {
    // 尝试从sessionStorage恢复当前任务ID
    try {
      const cachedTaskId = sessionStorage.getItem('current-task-id')
      if (cachedTaskId && !taskId) {
        const taskExists = taskHistory.some((task) => task.id === cachedTaskId)
        if (taskExists) {
          setTaskId(cachedTaskId)
          const cachedTask = taskHistory.find((task) => task.id === cachedTaskId)
          if (cachedTask) {
            setCurrentMessage(cachedTask.message || '')
          }
          return
        }
      }
    } catch (error) {
      console.error('Error restoring task ID from cache:', error)
    }

    if (taskHistory.length === 0) {
      const initialTaskId = Date.now().toString()
      addTask(initialTaskId, '')
      setTaskId(initialTaskId)
    } else if (!taskId && taskHistory.length > 0) {
      // Set current task to the most recent one if not set
      const latestTask = taskHistory[taskHistory.length - 1]
      if (latestTask) {
        setTaskId(latestTask.id)
        setCurrentMessage(latestTask.message || '')
      }
    }
  }, [taskHistory, taskId, addTask, setCurrentMessage])

  return {
    // State
    currentMessage,
    taskId,
    taskStatus,
    taskError,
    isPolling,
    showDialog,
    pendingSubmission,
    isFormDisabled: isFormDisabled(),
    // 删除对话框状态
    deleteDialogOpen,
    pendingDeleteTaskId,

    // Actions
    handleSubmit,
    handleDialogConfirm,
    handleDialogCancel,
    handleNewConversation,
    handleTaskClick,
    handleTaskDelete,
    confirmDeleteTask,
    cancelDeleteTask,
    setShowDialog,
    setDeleteDialogOpen,

    // Utility functions
    renderTemplateToHtml,
    processTaskOutput,
    handleTaskStatusUpdate,
    isCurrentTaskProcessing,
    isAnyTaskProcessing,
  }
}
