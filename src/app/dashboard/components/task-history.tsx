'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

interface TaskHistoryProps {
  onNewConversation: () => void
  currentTaskId: string | null
  onTaskClick?: (taskId: string) => void
}

export function TaskHistory({ onNewConversation, currentTaskId, onTaskClick }: TaskHistoryProps) {
  const { taskHistory } = useAppStore()

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {taskHistory.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              'flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-xs font-medium transition-all',
              task.status === 'processing'
                ? 'animate-pulse border-sky-400 bg-sky-500/15 text-sky-500'
                : currentTaskId === task.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/30',
            )}
            onClick={() => onTaskClick?.(task.id)}
            title={task.message}
          >
            {index + 1}
          </div>
        ))}

        <div
          className="bg-muted/20 text-muted-foreground hover:bg-muted/30 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm"
          onClick={onNewConversation}
          title="New conversation"
        >
          <Plus className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}
