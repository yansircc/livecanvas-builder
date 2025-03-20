import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useDialog } from './use-dialog'
import { useHtmlProcessor } from './use-html-processor'
import { useTaskOutput } from './use-task-output'
import { useTaskStatus } from './use-task-status'
import { useTaskSubmission, type FormValues } from './use-task-submission'

export function useTaskManager() {
  const { resetState, taskHistory, setState, isLoading, addTask, updateTaskStatus } = useAppStore()

  // Local state
  const [currentMessage, setCurrentMessage] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<'processing' | 'completed' | 'error' | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Create initial task if none exists
  useEffect(() => {
    if (taskHistory.length === 0) {
      const initialTaskId = Date.now().toString()
      addTask(initialTaskId, '')
      setTaskId(initialTaskId)
    } else if (!taskId && taskHistory.length > 0) {
      // Set current task to the most recent one if not set
      const latestTask = taskHistory[taskHistory.length - 1]
      if (latestTask) {
        setTaskId(latestTask.id)
      }
    }
  }, [taskHistory, taskId, addTask])

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

  // Check if the current task (by ID) is processing
  const isFormDisabled = useCallback(() => {
    if (!taskId) return false
    const currentTask = taskHistory.find((task) => task.id === taskId)
    return currentTask?.status === 'processing'
  }, [taskId, taskHistory])

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
        setCurrentMessage(clickedTask.message)

        // If the task has completed and has code/outputs, restore them
        if (clickedTask.status === 'completed' && clickedTask.code) {
          // Update the UI state with the task's data
          setState('code', clickedTask.code)

          if (clickedTask.advices) {
            setState('advices', clickedTask.advices)
          }

          if (clickedTask.processedHtml) {
            setState('processedHtml', clickedTask.processedHtml)
          } else if (clickedTask.code) {
            // If no processed HTML is available but code is, process it now
            const processedHtml = renderTemplateToHtml(clickedTask.code)
            if (processedHtml) {
              setState('processedHtml', processedHtml)
            }
          }

          if (clickedTask.usage) {
            setState('usage', clickedTask.usage)
          }
        } else if (clickedTask.status === 'processing') {
          // For processing tasks, clear the code display
          setState('code', null)
          setState('advices', [])
          setState('processedHtml', '')
          setState('usage', undefined)
        }

        console.log('Switched to task:', clickedTask.message)
      }
    },
    [taskHistory, setState, setTaskId, setCurrentMessage, renderTemplateToHtml],
  )

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

    // Actions
    handleSubmit,
    handleDialogConfirm,
    handleDialogCancel,
    handleNewConversation,
    handleTaskClick,
    setShowDialog,

    // Utility functions
    renderTemplateToHtml,
    processTaskOutput,
    handleTaskStatusUpdate,
    isCurrentTaskProcessing,
    isAnyTaskProcessing,
  }
}
