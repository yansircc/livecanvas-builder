'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
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

const ConfirmDialog = dynamic(
  () => import('./components/confirm-dialog').then((mod) => ({ default: mod.ConfirmDialog })),
  {
    ssr: false,
  },
)

export default function Page() {
  const { isLoading, code, advices, validationResult, model } = useAppStore()

  const {
    currentMessage,
    taskId,
    showDialog,
    handleSubmit,
    handleDialogConfirm,
    handleDialogCancel,
    handleNewConversation,
    handleTaskClick,
    setShowDialog,
    isFormDisabled,
  } = useTaskManager()

  // Reset state on initial load
  const { resetState } = useAppStore()
  useEffect(() => {
    resetState({ keepUserSettings: true, keepVersions: false, keepTaskHistory: true })
  }, [resetState])

  // Clear message when code is cleared
  useEffect(() => {
    if (code === null) {
      // This is handled in the hook now
    }
  }, [code])

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
      <Footer />
    </div>
  )
}
