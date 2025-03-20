import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-server'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side authentication check
  const session = await getServerSession()

  // If user is not logged in, redirect to signin page
  if (!session) {
    redirect('/signin')
  }

  return <>{children}</>
}
