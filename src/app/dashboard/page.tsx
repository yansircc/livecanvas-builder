'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import { ConfirmDialog } from './components/confirm-dialog'
import { TaskHistory } from './components/task-history'
import { useTaskManager } from './hooks/use-task-manager'

// Dynamically import heavy components
const CodeOutput = dynamic(
  () => import('./components/code-output').then((mod) => ({ default: mod.CodeOutput })),
  {
    loading: () => (
      <Card className="h-full p-6">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="h-[400px] w-full" />
      </Card>
    ),
    ssr: false,
  },
)

const EnhancedForm = dynamic(
  () => import('./components/enhanced-form').then((mod) => ({ default: mod.EnhancedForm })),
  {
    loading: () => (
      <Card className="p-6">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-6 h-40 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </Card>
    ),
    ssr: false,
  },
)

export default function Page() {
  const { isLoading, code, advices, validationResult, model } = useAppStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  // 重置确认对话框状态
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const {
    currentMessage,
    taskId,
    showDialog,
    deleteDialogOpen,
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
    isFormDisabled,
  } = useTaskManager()

  // 获取store中的方法
  const { resetState, clearAllData } = useAppStore()

  // 显示重置确认对话框
  const handleShowResetDialog = useCallback(() => {
    setResetDialogOpen(true)
  }, [])

  // 取消重置
  const cancelReset = useCallback(() => {
    setResetDialogOpen(false)
  }, [])

  // 实现彻底清除所有数据的函数
  const clearAllStoredData = useCallback(() => {
    // 清除所有sessionStorage中的数据
    try {
      sessionStorage.removeItem('dashboard-state')
      sessionStorage.removeItem('current-task-id')
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }

    // 清除store中的所有数据
    clearAllData()

    // 创建新的初始任务
    handleNewConversation()

    // 关闭对话框
    setResetDialogOpen(false)

    // 如果是通过URL参数重置的，则移除URL参数
    if (searchParams.get('reset') === 'true') {
      // 创建新的URL并导航
      router.replace('/dashboard')
    }

    console.log('所有数据已重置')
  }, [clearAllData, handleNewConversation, searchParams, router])

  // Implement client-side caching of state
  const initializeFromCache = useCallback(() => {
    try {
      // Check sessionStorage for cached state
      const cachedState = sessionStorage.getItem('dashboard-state')
      if (cachedState) {
        const parsedState = JSON.parse(cachedState)
        // Only use cache if it's less than 1 hour old
        const isCacheValid = Date.now() - parsedState.timestamp < 60 * 60 * 1000

        if (isCacheValid) {
          // First reset state
          resetState({
            keepUserSettings: true,
            keepVersions: false,
            keepTaskHistory: true,
          })

          // Then manually set each cached state property
          const data = parsedState.data
          if (data.code !== undefined) {
            useAppStore.getState().setState('code', data.code)
          }
          // 不从缓存中恢复advices，每次页面刷新时应该清空
          useAppStore.getState().setState('advices', [])
          if (data.validationResult !== undefined) {
            useAppStore.getState().setState('validationResult', data.validationResult)
          }
          if (data.model !== undefined) {
            useAppStore.getState().setState('model', data.model)
          }

          return true
        }
      }
    } catch (error) {
      console.error('Error restoring cached state:', error)
    }
    return false
  }, [resetState])

  useEffect(() => {
    // 检查URL参数是否包含reset=true
    const resetParam = searchParams.get('reset')
    if (resetParam === 'true') {
      clearAllStoredData()
      return
    }

    // 正常的缓存恢复逻辑
    const restored = initializeFromCache()
    if (!restored) {
      resetState({ keepUserSettings: true, keepVersions: false, keepTaskHistory: true })
    }

    // 确保页面加载后设置当前任务ID为最新任务
    const history = useAppStore.getState().taskHistory
    if (history.length > 0) {
      const latestTask = history[history.length - 1]
      if (latestTask && taskId !== latestTask.id) {
        try {
          sessionStorage.setItem('current-task-id', latestTask.id)
        } catch (error) {
          console.error('Error caching current task ID:', error)
        }
      }
    }
  }, [resetState, initializeFromCache, taskId, searchParams, clearAllStoredData])

  // Cache current state when it changes
  useEffect(() => {
    if (code !== null) {
      try {
        // Store current state in sessionStorage
        const stateToCache = {
          code,
          advices,
          validationResult,
          model,
          taskId,
        }

        sessionStorage.setItem(
          'dashboard-state',
          JSON.stringify({
            timestamp: Date.now(),
            data: stateToCache,
          }),
        )
      } catch (error) {
        console.error('Error caching state:', error)
      }
    }
  }, [code, advices, validationResult, model, taskId])

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
                currentTaskId={taskId}
                onTaskClick={handleTaskClick}
                onTaskDelete={handleTaskDelete}
                onReset={handleShowResetDialog}
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
                  isFormDisabled={isFormDisabled}
                  currentTaskId={taskId}
                />
              </div>

              {/* 右侧：输出面板 */}
              <div className="h-full">
                <CodeOutput
                  code={code ?? ''}
                  validationResult={validationResult}
                  isLoading={isLoading}
                  modelId={model}
                  taskId={taskId}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        title="任务正在处理"
        description="当前任务仍在处理中。是否想创建一个新的对话，而不是等待它完成？"
        confirmText="创建新对话"
        cancelText="取消"
      />

      {/* 删除会话确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        title="删除会话"
        description="您确定要删除这个会话吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
      />

      {/* 重置所有会话确认对话框 */}
      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onConfirm={clearAllStoredData}
        onCancel={cancelReset}
        title="重置所有会话"
        description="您确定要清除所有会话历史和数据吗？此操作无法撤销，将会完全重置应用状态。"
        confirmText="重置全部"
        cancelText="取消"
      />
      <Footer />
    </div>
  )
}
