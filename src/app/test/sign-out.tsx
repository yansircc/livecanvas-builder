'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'

interface SignOutProps {
  className?: string
}

export default function SignOut({ className }: SignOutProps) {
  return (
    <Button variant="destructive" onClick={() => signOut()} className={className}>
      Sign Out
    </Button>
  )
}
