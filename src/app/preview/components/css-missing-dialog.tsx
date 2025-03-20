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
          <DialogTitle>Custom CSS Required</DialogTitle>
          <DialogDescription>
            To preview components with your design system, you need to create a custom CSS theme
            first.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 text-sm">
          <p className="mb-2">Without a custom theme, your components may not display correctly.</p>
          <p>
            The theme wizard will help you create a custom theme that can be used with your
            components.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Continue Without Theme
          </Button>
          <Button onClick={handleRedirectToWizard}>Create Theme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
