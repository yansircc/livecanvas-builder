'use client'

import { LogOut, User } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { signOut, useSession } from '@/lib/auth-client'

export function UserAuthMenu() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
          },
        },
      })
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const navigateToSignIn = () => {
    setAuthDialogOpen(false)
    router.push('/signin')
  }

  const navigateToSignUp = () => {
    setAuthDialogOpen(false)
    router.push('/signup')
  }

  // Loading state
  if (isPending) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  // User is authenticated
  if (session?.user) {
    const userInitial = session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || 'User'} fill />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitial.toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {session.user.name && <p className="font-medium">{session.user.name}</p>}
              {session.user.email && (
                <p className="text-muted-foreground w-[200px] truncate text-sm">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? '正在退出...' : '退出'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // User is not authenticated
  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>登录</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>认证</DialogTitle>
          <DialogDescription>
            登录到您的账户或创建一个新账户以保存您的工作并访问更多功能。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={navigateToSignIn} className="w-full">
            登录
          </Button>
          <Button onClick={navigateToSignUp} variant="outline" className="w-full">
            创建账户
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
