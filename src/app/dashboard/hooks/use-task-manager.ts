import { useCallback, useState } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { useDialog } from './use-dialog'
import { useHtmlProcessor } from './use-html-processor'
import { useTaskOutput } from './use-task-output'
import { useTaskStatus } from './use-task-status'
import { useTaskSubmission, type FormValues } from './use-task-submission'

export function useTaskManager() {
  const { resetState, taskHistory, setState } = useAppStore()

  // Local state
  const [currentMessage, setCurrentMessage] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<'processing' | 'completed' | 'error' | null>(null)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

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
  const {
    showDialog,
    setShowDialog,
    pendingSubmission,
    setPendingSubmission,
    handleDialogConfirm,
    handleDialogCancel,
  } = useDialog(processSubmission)

  // Check if current task is processing
  const isCurrentTaskProcessing = useCallback(() => {
    if (!taskId) return false
    const currentTask = taskHistory.find((task) => task.id === taskId)
    return currentTask?.status === 'processing'
  }, [taskId, taskHistory])

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: FormValues) => {
      // Check if current task is still processing
      if (isCurrentTaskProcessing()) {
        // Store the submission and show dialog
        setPendingSubmission(data)
        setShowDialog(true)
        return
      }

      // Continue with normal submission
      void processSubmission(data, false)
    },
    [isCurrentTaskProcessing, processSubmission, setPendingSubmission, setShowDialog],
  )

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    resetState({ keepUserSettings: true, keepVersions: false })
    setCurrentMessage('')
    setTaskId(null)
  }, [resetState])

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
  }
}
