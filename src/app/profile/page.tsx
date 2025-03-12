'use client'

import { Code, CreditCard, FileText, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut, useSession } from '@/lib/auth-client'
import { ApiKeys } from './components/api-keys'
import { MyProjects } from './components/my-projects'
import { ProfileInfo } from './components/profile-info'

interface MenuItem {
  label: string
  value?: string
  key: string
  icon: React.ReactNode
  component?: React.ReactNode
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [activeSection, setActiveSection] = useState('profile')
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [isPending, session, router])

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
      component: <ProfileInfo user={session?.user} />,
    },
    {
      label: 'API密钥',
      key: 'api-keys',
      icon: <CreditCard className="h-4 w-4" />,
      component: <ApiKeys />,
    },
    {
      label: '我的项目',
      key: 'projects',
      icon: <Code className="h-4 w-4" />,
      component: <MyProjects userId={session?.user?.id} />,
    },
    {
      label: '条款和政策',
      key: 'terms',
      icon: <FileText className="h-4 w-4" />,
      value: '外部链接',
    },
  ]

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <MainNav />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400">加载个人信息...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If authenticated, show profile page
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left sidebar with profile card */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="px-6 pt-8 pb-6">
                  {/* Profile header */}
                  <div className="mb-6 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-zinc-200 ring-4 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
                        {session?.user?.image ? (
                          <Avatar className="h-full w-full">
                            <AvatarImage src={session.user.image} />
                            <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
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
                        {session?.user?.name || '用户'}
                      </h2>
                      <p className="text-zinc-600 dark:text-zinc-400">{session?.user?.email}</p>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-800" />

                  {/* Menu items */}
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() =>
                          item.key === 'terms'
                            ? window.open('https://aimaxhub.com/terms', '_blank')
                            : setActiveSection(item.key)
                        }
                        className={`flex w-full items-center justify-between rounded-lg p-2.5 transition-colors duration-200 ${
                          activeSection === item.key
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
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {item.value}
                          </span>
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
            </div>

            {/* Right content area */}
            <div className="md:col-span-8 lg:col-span-9">
              {/* Display the active component */}
              {menuItems.find((item) => item.key === activeSection)?.component}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
