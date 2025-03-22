import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/user'
import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { ApiKeys } from './components/api-keys'
import { FavoriteProjects } from './components/favorite-projects'
import { MyProjects } from './components/my-projects'
import { ProfileInfo } from './components/profile-info'
import ProfileLoading from './components/profile-loading'
import { ProfileSidebar } from './components/profile-sidebar'

interface ProfilePageProps {
  searchParams: Promise<{ section?: string }>
}

// Define user interface to match the shape from getCurrentUser
interface UserData {
  id: string
  name: string
  email: string
  image: string | null
  backgroundInfo: string | null
  createdAt: Date
  updatedAt: Date
}

// This component fetches the dynamic user data (no caching)
async function ProfilePageContent({ searchParams }: ProfilePageProps) {
  // Fetch user data from server action
  const result = await getCurrentUser()

  // Redirect to sign in if not authenticated
  if (!result.success) {
    redirect('/signin')
  }

  // Get current section from search params (dynamic, not cached)
  const currentSection = (await searchParams).section || 'profile'

  // Render the cached part of the UI
  return <CachedProfileContent user={result.user} currentSection={currentSection} />
}

// This component receives data and is cached
async function CachedProfileContent({
  user,
  currentSection,
}: {
  user: UserData
  currentSection: string
}) {
  'use cache'

  // Render the active section content
  const renderActiveSection = () => {
    switch (currentSection) {
      case 'api-keys':
        return <ApiKeys />
      case 'projects':
        return <MyProjects userId={user.id} />
      case 'favorites':
        return <FavoriteProjects userId={user.id} />
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Left sidebar with profile card */}
            <div className="md:col-span-4 lg:col-span-3">
              <ProfileSidebar user={user} activeSection={currentSection} />
            </div>

            {/* Right content area */}
            <div className="md:col-span-8 lg:col-span-9">{renderActiveSection()}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Main page component with Suspense
export default function ProfilePage(props: ProfilePageProps) {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfilePageContent {...props} />
    </Suspense>
  )
}
