import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
