import type { Metadata } from 'next'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'

export const metadata: Metadata = {
  title: 'LiveCanvas Gallery - 作品展示',
  description: '浏览、收藏和分享 LiveCanvas 社区创建的精美组件',
}

/**
 * 画廊布局
 * 注意：身份验证由中间件自动处理，不需要在此检查
 */
export default function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      <main className="flex-1 py-6">{children}</main>
      <Footer />
    </div>
  )
}
