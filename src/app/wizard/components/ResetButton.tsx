'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTailwindStore } from '../stores/tailwindStore'

export function ResetButton() {
  const [isResetting, setIsResetting] = useState(false)
  const resetStore = useTailwindStore((state) => state.resetStore)

  const handleReset = () => {
    setIsResetting(true)

    try {
      resetStore()
      console.log('Store reset successfully')
    } catch (error) {
      console.error('Error resetting store:', error)
    } finally {
      // 重置动画
      setTimeout(() => {
        setIsResetting(false)
      }, 1000)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1"
      onClick={handleReset}
      disabled={isResetting}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
      <span>重置</span>
    </Button>
  )
}
