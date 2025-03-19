import { redirect } from 'next/navigation'
import { MainNav } from '@/components/main-nav'
import { getServerSession } from '@/lib/auth-server'

export default async function WizardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()

  if (!session) {
    redirect('/signin')
  }
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      {children}
    </div>
  )
}
