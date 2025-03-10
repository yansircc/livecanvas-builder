'use client'

import { Laptop, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'

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
    <div className="flex items-center gap-2 rounded-lg border p-1">
      {(Object.entries(deviceConfigs) as [DeviceType, DeviceConfig][]).map(([key, config]) => {
        const Icon = config.icon
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleDeviceChange(key)}
            className={`rounded-md p-2 transition-colors ${
              selectedDevice === key
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-secondary/50'
            }`}
            title={config.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
