'use client'

import { toast } from 'sonner'
import { useAppStore } from '@/store/use-app-store'
import Logo from './logo'
import { ThemeToggle } from './theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { UserAuthMenu } from './user-auth-menu'

export default function Header() {
  const { resetState } = useAppStore()

  const handleReset = () => {
    // Reset all state to initial values
    resetState({ keepUserSettings: true, keepVersions: false })

    // Show a toast notification
    toast.success('重置到初始状态', {
      description: '所有提示和生成的内容已清除',
      duration: 3000,
    })
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2" onClick={handleReset}>
                  <Logo />
                  <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    LiveCanvas Builder
                  </h1>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>点击重置到初始状态</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-4">
          <UserAuthMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
