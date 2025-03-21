'use client'

import { Plus, RotateCcw, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

interface TaskHistoryProps {
  onNewConversation: () => void
  currentTaskId: string | null
  onTaskClick?: (taskId: string) => void
  onTaskDelete?: (taskId: string) => void
  onReset?: () => void
}

export function TaskHistory({
  onNewConversation,
  currentTaskId,
  onTaskClick,
  onTaskDelete,
  onReset,
}: TaskHistoryProps) {
  const { taskHistory } = useAppStore()

  // Get status style for task button
  const getTaskStatusStyle = (task: any, isSelected: boolean) => {
    switch (task.status) {
      case 'processing':
        return 'animate-pulse border-sky-400 bg-sky-500/15 text-sky-500 ring-1 ring-sky-400/30'
      case 'completed':
        return isSelected
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
      case 'error':
        return isSelected
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
      case 'idle':
      default:
        return isSelected
          ? 'bg-primary/10 text-primary'
          : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2 text-xs text-zinc-500 dark:text-zinc-400">对话：</span>
          <div className="flex flex-wrap gap-1">
            {taskHistory.map((task, index) => (
              <TooltipProvider key={task.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group relative">
                      <div
                        className={cn(
                          'flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-xs font-medium transition-all',
                          getTaskStatusStyle(task, currentTaskId === task.id),
                        )}
                        onClick={() => onTaskClick?.(task.id)}
                      >
                        {index + 1}

                        {/* 删除按钮，仅在悬停时显示 */}
                        {onTaskDelete && (
                          <button
                            className="absolute -top-1 -right-1 hidden h-2.5 w-2.5 cursor-pointer items-center justify-center rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:flex group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation() // 防止触发onClick事件
                              onTaskDelete(task.id)
                            }}
                            aria-label="删除会话"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    <div className="text-xs">
                      <p className="font-medium">对话 {index + 1}</p>
                      {task.message && <p className="max-w-72 truncate">{task.message}</p>}
                      <p className="text-muted-foreground mt-1 text-xs">
                        状态:{' '}
                        {task.status === 'idle'
                          ? '等待中'
                          : task.status === 'processing'
                            ? '生成中'
                            : task.status === 'completed'
                              ? '已完成'
                              : '出错了'}
                      </p>
                      {task.status === 'processing' && (
                        <p className="mt-1 text-xs text-sky-500">
                          您可以创建新对话或切换到其他对话
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'bg-muted/20 text-muted-foreground relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm hover:bg-sky-500/15 hover:text-sky-500 dark:hover:bg-sky-900/30 dark:hover:text-sky-400',
                    )}
                    onClick={onNewConversation}
                  >
                    <Plus className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">创建新对话 #{taskHistory.length + 1}</p>
                  <p className="text-muted-foreground text-xs">
                    可随时创建新对话，无需等待生成完成
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 重置按钮 */}
        {onReset && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-muted-foreground flex h-6 items-center gap-1 rounded-sm px-1.5 text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  onClick={onReset}
                  aria-label="重置所有会话"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>重置</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-medium">重置所有会话</p>
                  <p className="text-muted-foreground">这将删除所有会话历史，无法恢复</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
