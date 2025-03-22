import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { ApiKeys } from './components/api-keys'
import { MyProjects } from './components/my-projects'
import { ProfileInfo } from './components/profile-info'
import ProfileLoading from './components/profile-loading'
import { ProfileSidebar } from './components/profile-sidebar'

export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  searchParams: Promise<{ section?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  // Fetch user data from server action
  const { success, user } = await getCurrentUser()

  // Redirect to sign in if not authenticated
  if (!success || !user) {
    redirect('/signin')
  }

  // Determine which section to show based on query params
  const currentSection = (await searchParams).section || 'profile'

  // Render the active section content
  const renderActiveSection = () => {
    switch (currentSection) {
      case 'api-keys':
        return <ApiKeys />
      case 'projects':
        return <MyProjects userId={user.id} />
      case 'profile':
      default:
        return <ProfileInfo user={user} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<ProfileLoading />}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Left sidebar with profile card */}
              <div className="md:col-span-4 lg:col-span-3">
                <ProfileSidebar user={user} activeSection={currentSection} />
              </div>

              {/* Right content area */}
              <div className="md:col-span-8 lg:col-span-9">{renderActiveSection()}</div>
            </div>
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
