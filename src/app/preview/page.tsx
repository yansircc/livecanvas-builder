import { Suspense } from 'react'
import { PreviewContent } from './components/preview-content'

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">Loading preview...</div>
      }
    >
      <PreviewContent />
    </Suspense>
  )
}
