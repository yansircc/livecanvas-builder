import { Suspense } from 'react'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { GalleryLoading } from './components/gallery-loading'
import { GalleryTabsContainer } from './components/gallery-tabs-container'

export const metadata = {
  title: 'LiveCanvas Gallery - 作品展示',
  description: '浏览、收藏和分享 LiveCanvas 社区创建的精美组件',
}

/**
 * Optimized Gallery page with server components and Suspense
 * Using layout pattern for better performance and user experience
 */
export default function Gallery2Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="container mx-auto flex-1 px-6 py-12 dark:bg-zinc-950">
        <Suspense fallback={<GalleryLoading />}>
          <GalleryTabsContainer />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
