'use client'

import { Laptop, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DeviceConfig {
  width: string
  height: string
  label: string
  icon: typeof Laptop
}

export const deviceConfigs: Record<DeviceType, DeviceConfig> = {
  mobile: {
    width: '375px',
    height: '667px',
    label: '手机',
    icon: Smartphone,
  },
  tablet: {
    width: '768px',
    height: '1024px',
    label: '平板',
    icon: Tablet,
  },
  desktop: {
    width: '100%',
    height: '100%',
    label: '桌面',
    icon: Laptop,
  },
}

interface DeviceSelectorProps {
  onDeviceChange: (device: DeviceType) => void
  initialDevice?: DeviceType
}

export function DeviceSelector({ onDeviceChange, initialDevice = 'desktop' }: DeviceSelectorProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(initialDevice)

  const handleDeviceChange = (device: DeviceType) => {
    setSelectedDevice(device)
    onDeviceChange(device)
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      {(Object.entries(deviceConfigs) as [DeviceType, DeviceConfig][]).map(([key, config]) => {
        const Icon = config.icon
        const isSelected = selectedDevice === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleDeviceChange(key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all',
              isSelected
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100',
            )}
            title={config.label}
          >
            <Icon className={cn('h-4 w-4', isSelected && 'text-current')} />
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
