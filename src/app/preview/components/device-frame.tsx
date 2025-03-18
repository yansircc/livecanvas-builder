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

// Desktop frame (simple browser-like)
function DesktopFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-full rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex h-8 items-center rounded-t-lg bg-neutral-100 px-3 dark:bg-neutral-700">
        <div className="flex space-x-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
        </div>
      </div>

      {/* Content area */}
      <div className="w-full overflow-hidden">{children}</div>
    </div>
  )
}

// Mobile frame (simplified)
function MobileFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-[18px] border-[8px] border-neutral-900 bg-neutral-800 shadow-md dark:border-neutral-700',
        className,
      )}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 z-10 h-5 w-16 -translate-x-1/2 rounded-b-xl bg-neutral-900 dark:bg-neutral-700"></div>

      {/* Content area */}
      <div className="overflow-hidden bg-white dark:bg-neutral-800">{children}</div>
    </div>
  )
}

// Tablet frame (simplified)
function TabletFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-[16px] border-[8px] border-neutral-800 bg-neutral-700 shadow-md dark:border-neutral-700',
        className,
      )}
    >
      {/* Camera */}
      <div className="absolute top-2 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-neutral-600 dark:bg-neutral-500"></div>

      {/* Content area */}
      <div className="overflow-hidden bg-white dark:bg-neutral-800">{children}</div>
    </div>
  )
}
