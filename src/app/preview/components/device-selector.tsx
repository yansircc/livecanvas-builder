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
    label: 'Mobile',
    icon: Smartphone,
  },
  tablet: {
    width: '768px',
    height: '1024px',
    label: 'Tablet',
    icon: Tablet,
  },
  desktop: {
    width: '100%',
    height: '100%',
    label: 'Desktop',
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
    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
      {(Object.entries(deviceConfigs) as [DeviceType, DeviceConfig][]).map(([key, config]) => {
        const Icon = config.icon
        const isSelected = selectedDevice === key

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleDeviceChange(key)}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-all',
              isSelected
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
            )}
            title={config.label}
          >
            <Icon className={cn('h-4 w-4', isSelected && 'text-current')} />
            <span className="hidden md:inline">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
