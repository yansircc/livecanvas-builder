import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CssMissingDialogProps {
  open: boolean
  onClose: () => void
}

export function CssMissingDialog({ open, onClose }: CssMissingDialogProps) {
  const router = useRouter()

  const handleRedirectToWizard = () => {
    router.push('/wizard')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>需要自定义 CSS</DialogTitle>
          <DialogDescription>
            要预览组件与你的组件库，你需要先创建一个自定义 CSS 主题。
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 text-sm">
          <p className="mb-2">没有自定义主题，你的组件可能无法正确显示。</p>
          <p>主题向导将帮助你创建一个自定义主题，可以与你的组件一起使用。</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            继续使用默认主题
          </Button>
          <Button onClick={handleRedirectToWizard}>创建主题</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
