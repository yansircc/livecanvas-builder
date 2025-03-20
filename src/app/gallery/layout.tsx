import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { getServerSession } from '@/lib/auth-server'

export const metadata: Metadata = {
  title: 'LiveCanvas Gallery - 作品展示',
  description: '浏览、收藏和分享 LiveCanvas 社区创建的精美组件',
}

export default async function GalleryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      <main className="flex-1 py-6">{children}</main>
      <Footer />
    </div>
  )
}
