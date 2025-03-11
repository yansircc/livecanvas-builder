'use client'

import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
}

export function EmptyState({ message, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <div className="flex h-64 flex-col items-center justify-center">
      <p className="mb-4 text-zinc-500">{message}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
      {children}
    </div>
  )
}
