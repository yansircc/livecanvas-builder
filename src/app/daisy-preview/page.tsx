'use client'

import { FileCode, Monitor, Smartphone, Tablet } from 'lucide-react'
import { CopyButton } from './components/copy-button'
import { CssMissingDialog } from './components/css-missing-dialog'
import { PublishProjectDialog } from './components/publish-project-dialog'
import { ThemeSwitcher } from './components/theme-swither'
import { usePreview } from './hooks/use-preview'
import { useScreenshot } from './hooks/use-screenshot'

export default function DaisyPreviewPage() {
  const {
    iframeContent,
    device,
    iframeHeight,
    uniqueKey,
    iframeRef,
    showCssMissingDialog,
    hasDataTheme,
    availableThemes,
    currentTheme,
    setDevice,
    handleCloseCssMissingDialog,
    getContentToCopy,
    changeTheme,
  } = usePreview()

  // Use the screenshot hook
  const { getScreenshot, isCapturing } = useScreenshot({
    iframeRef,
    device,
    setDevice,
  })

  const isDesktop = device === 'desktop'
  const currentDevice = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: 'auto' },
  }[device]

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-neutral-50 dark:bg-neutral-900">
      {/* CSS Missing Dialog */}
      <CssMissingDialog open={showCssMissingDialog} onClose={handleCloseCssMissingDialog} />

      {/* Header with actions */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <FileCode className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                DaisyUI Preview
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Preview with your HTML
              </p>
            </div>
          </div>

          <PublishProjectDialog
            htmlContent={getContentToCopy()}
            getScreenshot={getScreenshot}
            isCapturingScreenshot={isCapturing}
          />
        </div>
      </header>

      {/* Main content area - Only Preview */}
      <main className="flex-1 p-4">
        {/* Preview area */}
        <div className="container mx-auto flex h-full flex-col rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
            <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Preview</h2>

            {/* Device selector - moved from header to preview bar */}
            <div className="flex items-center rounded-md border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
              <button
                onClick={() => setDevice('mobile')}
                className={`flex h-7 w-7 items-center justify-center rounded-sm ${
                  device === 'mobile'
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
                title="Mobile view"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`flex h-7 w-7 items-center justify-center rounded-sm ${
                  device === 'tablet'
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
                title="Tablet view"
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`flex h-7 w-7 items-center justify-center rounded-sm ${
                  device === 'desktop'
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                }`}
                title="Desktop view"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Switcher - only show if HTML has data-theme */}
              {hasDataTheme && (
                <ThemeSwitcher
                  availableThemes={availableThemes}
                  currentTheme={currentTheme}
                  onThemeChange={changeTheme}
                />
              )}

              {/* Copy HTML Button */}
              <CopyButton getContentToCopy={getContentToCopy} />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div
              className="mx-auto"
              style={{
                width: currentDevice.width,
                maxWidth: isDesktop ? '100%' : currentDevice.width,
                transition: 'width 0.3s ease',
              }}
            >
              <div
                className={`relative overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 ${
                  !isDesktop ? 'mx-auto' : 'w-full max-w-full'
                }`}
              >
                <div
                  className="bg-white dark:bg-neutral-950"
                  style={{
                    height: !isDesktop ? currentDevice.height : `${iframeHeight}px`,
                    transition: 'height 0.3s ease',
                    overflow: !isDesktop ? 'hidden' : 'visible',
                  }}
                >
                  <iframe
                    key={uniqueKey}
                    ref={iframeRef}
                    srcDoc={iframeContent}
                    className="h-full w-full border-0"
                    title="DaisyUI Preview"
                    sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
                    loading="lazy"
                    onLoad={() => {
                      // Try to force a resize after load
                      setTimeout(() => {
                        iframeRef.current?.contentWindow?.postMessage('checkSize', '*')
                      }, 200)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
