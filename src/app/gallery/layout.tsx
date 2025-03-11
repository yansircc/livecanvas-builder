import type { Metadata } from 'next'
import { MainNav } from '@/components/main-nav'

export const metadata: Metadata = {
  title: 'LiveCanvas Gallery - 作品展示',
  description: '浏览、收藏和分享 LiveCanvas 社区创建的精美组件',
}

export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      {children}
    </div>
  )
}
