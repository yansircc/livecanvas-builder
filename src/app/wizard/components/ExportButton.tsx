import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ExportButtonProps {
  cssCode: string
  config: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    headingFont: string
    bodyFont: string
    monoFont: string
    borderRadius: string
    buttonStyle: string
  }
  borderRadiusLabel: string
}

export function ExportButton({ cssCode, config, borderRadiusLabel }: ExportButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Format button style with capitalization
  const formatButtonStyle = (style: string): string => {
    return style.charAt(0).toUpperCase() + style.slice(1)
  }

  // Copy code to clipboard
  const copyToClipboard = () => {
    void navigator.clipboard.writeText(cssCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative">
      <div
        className="relative"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '已复制！' : '复制配置'}
        </Button>

        {showInfo && (
          <div className="absolute top-full right-0 z-10 mt-2 w-64 rounded-md bg-white p-4 shadow-lg dark:bg-zinc-950">
            <div className="text-sm text-gray-600">
              <p className="font-medium">你的配置包括:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li className="flex items-center gap-2">
                  颜色:
                  <span
                    className="h-4 w-4 rounded-sm"
                    style={{ backgroundColor: config.primaryColor }}
                    title={config.primaryColor}
                  ></span>
                  <span
                    className="h-4 w-4 rounded-sm"
                    style={{ backgroundColor: config.secondaryColor }}
                    title={config.secondaryColor}
                  ></span>
                  <span
                    className="h-4 w-4 rounded-sm"
                    style={{ backgroundColor: config.accentColor }}
                    title={config.accentColor}
                  ></span>
                </li>
                <li>
                  字体: {config.headingFont} (headings), {config.bodyFont} (body), {config.monoFont}{' '}
                  (code)
                </li>
                <li>按钮样式: {formatButtonStyle(config.buttonStyle)}</li>
                <li>边框半径: {borderRadiusLabel}</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                这个配置适用于 Tailwind CSS v4 的新语法和特性。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
