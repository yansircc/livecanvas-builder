import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CopyButtonProps {
  getContentToCopy: () => string
}

export function CopyButton({ getContentToCopy }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      const content = getContentToCopy()
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('代码已复制到剪贴板')

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }, [getContentToCopy])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            aria-label="复制代码"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>复制 HTML</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
