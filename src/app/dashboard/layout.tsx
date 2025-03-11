import { MainNav } from '@/components/main-nav'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MainNav />
      {children}
    </div>
  )
}
