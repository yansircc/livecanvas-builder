import Footer from '@/components/footer'
import { MainNav } from '@/components/main-nav'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <MainNav />

      <main className="flex-1 py-6">
        <div className="container mx-auto h-full px-4">
          <div className="space-y-6">
            {/* Task History Skeleton */}
            <div className="px-1">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-32" />
                <div className="flex-1 overflow-auto">
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-36 rounded-md" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
              {/* Form Panel Skeleton */}
              <Card className="p-6">
                <Skeleton className="mb-4 h-8 w-3/4" />
                <Skeleton className="mb-6 h-40 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Skeleton className="h-10 w-24" />
                </div>
              </Card>

              {/* Output Panel Skeleton */}
              <Card className="h-full p-6">
                <Skeleton className="mb-4 h-8 w-1/2" />
                <Skeleton className="h-[400px] w-full" />
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
