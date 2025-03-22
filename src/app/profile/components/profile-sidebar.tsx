'use client'

import { Code, CreditCard, FileText, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from '@/lib/auth-client'

interface ProfileSidebarProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    backgroundInfo?: string | null
  }
  activeSection?: string
}

interface MenuItem {
  label: string
  value?: string
  key: string
  icon: React.ReactNode
}

export function ProfileSidebar({ user, activeSection = 'profile' }: ProfileSidebarProps) {
  const router = useRouter()
  const [localActiveSection, setLocalActiveSection] = useState(activeSection)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Update local state when prop changes
  useEffect(() => {
    setLocalActiveSection(activeSection)
  }, [activeSection])

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
      console.error('退出失败:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Define menu items
  const menuItems: MenuItem[] = [
    {
      label: '个人信息',
      key: 'profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      label: 'API密钥',
      key: 'api-keys',
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: '我的项目',
      key: 'projects',
      icon: <Code className="h-4 w-4" />,
    },
    {
      label: 'API推荐来源',
      key: 'terms',
      icon: <FileText className="h-4 w-4" />,
      value: '外部链接',
    },
  ]

  // Handle section navigation
  const handleSectionChange = (key: string) => {
    if (key === 'terms') {
      window.open('https://aihubmix.com?aff=P6qM', '_blank')
      return
    }

    // Change the URL to reflect the current section
    router.push(`/profile?section=${key}`, { scroll: false })
    setLocalActiveSection(key)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="px-6 pt-8 pb-6">
        {/* Profile header */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
              {user?.image ? (
                <Avatar className="h-full w-full">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-zinc-500" />
                </div>
              )}
            </div>
            <div className="absolute right-0 bottom-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.name || '用户'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">{user?.email}</p>
          </div>
        </div>

        <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Menu items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleSectionChange(item.key)}
              className={`flex w-full items-center justify-between rounded-lg p-2.5 transition-colors duration-200 ${
                localActiveSection === item.key
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.label}
                </span>
              </div>
              {item.value && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.value}</span>
              )}
            </button>
          ))}

          {/* Logout button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-between rounded-lg p-2.5 transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {isSigningOut ? '正在退出...' : '退出'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
