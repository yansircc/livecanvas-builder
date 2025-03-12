import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Server-side authentication check
  const session = await getServerSession()

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
