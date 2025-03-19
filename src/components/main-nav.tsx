'use client'

import { GalleryHorizontal, Home, Palette } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { UserAuthMenu } from '@/components/user-auth-menu'

export function MainNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            LiveCanvas Builder
          </Link>
          <div className="hidden items-center space-x-1 md:flex">
            <Link href="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
                size="sm"
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                variant={isActive('/gallery') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
                size="sm"
              >
                <GalleryHorizontal className="h-4 w-4" />
                <span>画廊</span>
              </Button>
            </Link>
            <Link href="/wizard">
              <Button
                variant={isActive('/wizard') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
                size="sm"
              >
                <Palette className="h-4 w-4" />
                <span>样式生成</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserAuthMenu />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
