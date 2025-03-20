import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function GalleryLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {/* Tabs Skeleton */}
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            </TabsList>

            {/* Search bar skeleton */}
            <div className="mb-6 flex items-center">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>

            {/* Projects grid skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
