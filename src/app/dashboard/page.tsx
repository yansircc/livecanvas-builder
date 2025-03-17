'use client'

import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ModelId } from '@/lib/models'
import { useAppStore } from '@/store/use-app-store'
import { processHtml } from '@/utils/process-html'
import {
  pollTaskStatus,
  submitTask,
  type ConversationHistoryItem,
  type TaskResponse,
} from '@/utils/task-manager'
import { CodeOutput } from './components/code-output'
import { EnhancedForm, MAX_CONTEXT_LENGTH } from './components/enhanced-form'
import { TaskHistory } from './components/task-history'

// Interface for the form values from EnhancedForm
interface FormValues {
  message: string
  includeContext: boolean
}

// Interface for the complete form data needed for API call
interface CompleteFormData {
  message: string
  model: ModelId
  apiKey: string
  context: string
}

function openPreview(html: string) {
  const contentId = Date.now().toString()
  localStorage.setItem(`preview_content_${contentId}`, html)
  window.open(`/preview?id=${contentId}`, '_blank')
}

export default function Page() {
  // Dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState<
    (FormValues & { context?: string }) | null
  >(null)

  const {
    apiKey,
    model,
    context,
    isLoading,
    code,
    advices,
    validationResult,
    versions,
    currentVersionIndex,
    setState,
    addVersion,
    resetState,
    addTask,
    updateTaskStatus,
    taskHistory,
  } = useAppStore()

  // 状态管理 - 保留状态但不在UI中显示
  const [currentMessage, setCurrentMessage] = useState('')
  const [_taskId, setTaskId] = useState<string | null>(null)
  const [_taskStatus, setTaskStatus] = useState<'processing' | 'completed' | 'error' | null>(null)
  const [_taskError, setTaskError] = useState<string | null>(null)
  const [_isPolling, setIsPolling] = useState(false)

  // 初始化和重置
  useEffect(() => {
    resetState({ keepUserSettings: true, keepVersions: false })
  }, [resetState])

  useEffect(() => {
    if (code === null) {
      setCurrentMessage('')
    }
  }, [code])

  // Handle new conversation
  const handleNewConversation = useCallback(() => {
    resetState({ keepUserSettings: true, keepVersions: false })
    setCurrentMessage('')
    setTaskId(null)
  }, [resetState])

  // Check if current task is processing
  const isCurrentTaskProcessing = useCallback(() => {
    if (!_taskId) return false
    const currentTask = taskHistory.find((task) => task.id === _taskId)
    return currentTask?.status === 'processing'
  }, [_taskId, taskHistory])

  // HTML 处理
  const renderTemplateToHtml = useCallback(
    (htmlCode: string) => {
      try {
        try {
          const processedHtmlWithIcons = processHtml(htmlCode)
          setState('processedHtml', processedHtmlWithIcons)
          return processedHtmlWithIcons
        } catch (iconError) {
          console.error('Error processing icons:', iconError)
          setState('processedHtml', htmlCode)
          return htmlCode
        }
      } catch (error) {
        console.error('Error displaying HTML:', error)
        setState('validationResult', {
          valid: false,
          errors: ['处理HTML失败'],
        })
        return null
      }
    },
    [setState],
  )

  // Handle task click
  const handleTaskClick = useCallback(
    (taskId: string) => {
      // Find the clicked task in the history
      const clickedTask = taskHistory.find((task) => task.id === taskId)

      if (clickedTask) {
        // Set the current task ID
        setTaskId(taskId)

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

  // 处理任务输出
  const processTaskOutput = useCallback(
    (output: any) => {
      if (!output?.code) return

      // 设置代码
      setState('code', output.code)

      // 处理建议
      if (output.advices) {
        const processedAdvices = Array.isArray(output.advices)
          ? output.advices
              .filter(Boolean)
              .map((advice: unknown) => (typeof advice === 'string' ? advice : String(advice)))
          : [String(output.advices)]

        setState('advices', processedAdvices)
      } else {
        setState('advices', [])
      }

      // 保存 token 使用信息
      if (output.usage) {
        setState('usage', output.usage)
      }

      // 处理 HTML
      const processedHtml = renderTemplateToHtml(output.code)

      // 添加新版本
      const formData = {
        message: currentMessage,
        model,
        apiKey,
        context,
      }

      addVersion(currentMessage, formData)

      // 打开预览
      if (processedHtml) {
        openPreview(processedHtml)
      }
    },
    [setState, renderTemplateToHtml, currentMessage, model, apiKey, context, addVersion],
  )

  // 处理任务状态更新
  const handleTaskStatusUpdate = useCallback(
    (status: TaskResponse) => {
      const taskId = status.taskId
      console.log('任务状态更新:', status)

      // Only update the current task status if it matches the active task
      if (taskId === _taskId) {
        setTaskStatus(status.status)
      }

      // Update task status in history with output if available
      updateTaskStatus(
        taskId,
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
        if (taskId === _taskId) {
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
    [processTaskOutput, updateTaskStatus, _taskId],
  )

  // 构建对话历史
  const buildConversationHistory = useCallback((): ConversationHistoryItem[] => {
    const history: ConversationHistoryItem[] = []

    if (currentVersionIndex >= 0 && versions.length > 0) {
      const currentVersion = versions[currentVersionIndex]
      if (currentVersion) {
        history.push({
          prompt: currentVersion.prompt,
          response: currentVersion.code ?? '',
        })
      }
      console.log('优化上下文: 仅发送最新的AI响应')
    }

    return history
  }, [currentVersionIndex, versions])

  // Process the actual submission
  const processSubmission = useCallback(
    async (data: FormValues & { context?: string }, forceNewConversation: boolean) => {
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

      if (completeData.context && completeData.context.length > MAX_CONTEXT_LENGTH) {
        toast.error(`背景信息必须少于 ${MAX_CONTEXT_LENGTH} 个字符`)
        return
      }

      // Reset task-specific state for new tasks
      // Don't reset taskId if we're continuing a conversation and not forcing new conversation
      const isContinuingTask =
        !forceNewConversation && !!_taskId && taskHistory.some((task) => task.id === _taskId)

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

        console.log('任务已提交:', taskResponse)

        // 保存任务ID
        if (taskResponse.taskId) {
          setTaskId(taskResponse.taskId)
          setTaskStatus('processing')
          toast.success('正在生成中，请稍候...')

          // Add task to history only if we're not continuing an existing task
          if (!isContinuingTask) {
            addTask(taskResponse.taskId, completeData.message)
          }

          // 开始轮询任务状态
          setIsPolling(true)

          void pollTaskStatus({
            taskId: taskResponse.taskId,
            onStatusUpdate: handleTaskStatusUpdate,
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
      _taskId,
      taskHistory,
      setCurrentMessage,
      setTaskId,
      setTaskStatus,
      setTaskError,
      setIsPolling,
    ],
  )

  // 提交表单处理
  const handleSubmit = useCallback(
    async (data: FormValues & { context?: string }) => {
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
    [isCurrentTaskProcessing, processSubmission],
  )

  // Handle dialog confirmation
  const handleDialogConfirm = useCallback(() => {
    if (pendingSubmission) {
      // Process as a new conversation
      void processSubmission(pendingSubmission, true)
      setPendingSubmission(null)
    }
    setShowDialog(false)
  }, [pendingSubmission, processSubmission])

  // Handle dialog cancellation
  const handleDialogCancel = useCallback(() => {
    setPendingSubmission(null)
    setShowDialog(false)
  }, [])

  const handleAdviceClick = (advice: string) => {
    console.log('建议点击:', advice)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />

      <main className="flex-1 py-6">
        <div className="container mx-auto h-full px-4">
          <div className="space-y-6">
            {/* Ultra-minimal Task History */}
            <div className="px-1">
              <TaskHistory
                onNewConversation={handleNewConversation}
                currentTaskId={_taskId}
                onTaskClick={handleTaskClick}
              />
            </div>

            {/* Main Content Area */}
            <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
              {/* 左侧：表单面板 */}
              <div>
                <EnhancedForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  advices={advices}
                  onAdviceClick={handleAdviceClick}
                  initialMessage={currentMessage}
                />
              </div>

              {/* 右侧：输出面板 */}
              <div className="h-full">
                <CodeOutput
                  code={code ?? ''}
                  validationResult={validationResult}
                  isLoading={isLoading}
                  modelId={model}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>任务正在处理</AlertDialogTitle>
            <AlertDialogDescription>
              当前任务仍在处理中。是否想创建一个新的对话，而不是等待它完成？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogCancel}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDialogConfirm}>创建新对话</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
