import { useCallback, useState } from 'react'
import { type FormValues } from './use-task-submission'

export function useDialog(
  processSubmission: (data: FormValues, forceNewConversation: boolean) => Promise<void>,
) {
  const [showDialog, setShowDialog] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState<FormValues | null>(null)

  // Handle dialog confirmation
  const handleDialogConfirm = useCallback(() => {
    if (pendingSubmission) {
      // Process as a new conversation
      void processSubmission(pendingSubmission, true)
      setPendingSubmission(null)
    }
    setShowDialog(false)
  }, [pendingSubmission, processSubmission])

  // Handle dialog cancellation
  const handleDialogCancel = useCallback(() => {
    setPendingSubmission(null)
    setShowDialog(false)
  }, [])

  return {
    showDialog,
    setShowDialog,
    pendingSubmission,
    setPendingSubmission,
    handleDialogConfirm,
    handleDialogCancel,
  }
}
