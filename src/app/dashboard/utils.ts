import { toast } from 'sonner'
import { processHtml } from '@/utils/process-html'
import { type TaskResponse } from '@/utils/task-manager'

// Open a preview window with the given HTML content
export function openPreview(html: string): void {
  const contentId = Date.now().toString()
  localStorage.setItem(`preview_content_${contentId}`, html)
  window.open(`/preview?id=${contentId}`, '_blank')
}

// Render HTML template to processed HTML
export function renderTemplateToHtml(htmlCode: string, setState: any): string | null {
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
}

// Process task output
export function processTaskOutput(
  output: any,
  setState: any,
  currentMessage: string,
  model: any,
  apiKey: string,
  context: string,
  addVersion: any,
): void {
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
  const processedHtml = renderTemplateToHtml(output.code, setState)

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
}

// Handle task status update
export function handleTaskStatusUpdate(
  status: TaskResponse,
  _taskId: string | null,
  setTaskStatus: any,
  setTaskError: any,
  updateTaskStatus: any,
  processTaskOutput: (output: any) => void,
): void {
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
      setTaskError(typeof status.error === 'string' ? status.error : JSON.stringify(status.error))
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
}

// Build conversation history
export function buildConversationHistory(currentVersionIndex: number, versions: any[]): any[] {
  const history: any[] = []

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
}
