'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { DeviceType } from './device-selector'

interface DeviceFrameProps {
  children: React.ReactNode
  deviceType: DeviceType
  className?: string
}

export function DeviceFrame({ children, deviceType, className }: DeviceFrameProps) {
  // Render different device frames based on the device type
  switch (deviceType) {
    case 'mobile':
      return <MobileFrame className={className}>{children}</MobileFrame>
    case 'tablet':
      return <TabletFrame className={className}>{children}</TabletFrame>
    case 'desktop':
    default:
      return <DesktopFrame className={className}>{children}</DesktopFrame>
  }
}

// Desktop frame (Mac-like browser)
function DesktopFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-full rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex h-9 items-center rounded-t-lg bg-zinc-100 px-4 dark:bg-zinc-700">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto flex h-6 w-2/3 items-center rounded-md bg-white px-3 text-xs text-zinc-500 dark:bg-zinc-600 dark:text-zinc-300">
          preview.livecanvas.io
        </div>
      </div>

      {/* Content area */}
      <div className="min-h-[600px] w-full overflow-auto">{children}</div>
    </div>
  )
}

// Mobile frame (iPhone-like)
function MobileFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-[40px] border-[14px] border-zinc-900 bg-zinc-800 shadow-xl dark:border-zinc-700',
        className,
      )}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 z-10 h-6 w-1/3 -translate-x-1/2 rounded-b-xl bg-zinc-900 dark:bg-zinc-700"></div>

      {/* Status bar */}
      <div className="relative h-8 bg-white dark:bg-zinc-800">
        <div className="absolute top-1.5 right-4 flex items-center space-x-1.5">
          <div className="h-2 w-4 rounded-sm bg-zinc-800 dark:bg-zinc-300"></div>
          <div className="h-2 w-2 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
          <div className="h-2 w-2 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
        </div>
      </div>

      {/* Content area */}
      <div className="overflow-auto bg-white dark:bg-zinc-800">{children}</div>

      {/* Home indicator */}
      <div className="flex h-8 items-center justify-center bg-white dark:bg-zinc-800">
        <div className="h-1 w-1/3 rounded-full bg-zinc-300 dark:bg-zinc-600"></div>
      </div>
    </div>
  )
}

// Tablet frame (iPad-like)
function TabletFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-[24px] border-[12px] border-zinc-800 bg-zinc-700 shadow-xl dark:border-zinc-700',
        className,
      )}
    >
      {/* Camera */}
      <div className="absolute top-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-600 dark:bg-zinc-500"></div>

      {/* Status bar */}
      <div className="relative h-6 bg-white dark:bg-zinc-800">
        <div className="absolute top-1.5 right-4 flex items-center space-x-1.5">
          <div className="h-1.5 w-3 rounded-sm bg-zinc-800 dark:bg-zinc-300"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
        </div>
      </div>

      {/* Content area */}
      <div className="overflow-auto bg-white dark:bg-zinc-800">{children}</div>

      {/* Home button */}
      <div className="flex h-6 items-center justify-center bg-white dark:bg-zinc-800">
        <div className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
      </div>
    </div>
  )
}
