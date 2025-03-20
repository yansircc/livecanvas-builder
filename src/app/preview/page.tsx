import { Suspense } from 'react'
import { LoadingSpinner } from './components/loading-spinner'
import { PreviewContent } from './components/preview-content'

export default function PreviewPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PreviewContent />
    </Suspense>
  )
}
