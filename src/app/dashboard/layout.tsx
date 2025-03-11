import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If user is not logged in, redirect to signin page
  if (!session) {
    redirect('/signin')
  }

  return <>{children}</>
}
