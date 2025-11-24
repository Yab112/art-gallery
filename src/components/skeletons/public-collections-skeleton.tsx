import { Skeleton } from "@/components/ui/skeleton";

export function PublicCollectionsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="bg-white rounded-md border border-gray-200 mb-3">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Hot Collections Section Skeleton */}
        <div className="bg-white rounded-md border border-gray-200 mb-3 p-4">
          <div className="flex items-center space-x-1.5 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md overflow-hidden bg-white">
                <Skeleton className="w-full h-20" />
                <div className="p-2">
                  <Skeleton className="h-3 w-full mb-1" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-8" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Collections Section Skeleton */}
        <div className="bg-white rounded-md border border-gray-200 mb-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
            </div>
          </div>

          {/* Quick Filter Chips Skeleton */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-24 rounded-full" />
            ))}
          </div>

          {/* Collections Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md overflow-hidden bg-white">
                <Skeleton className="w-full h-24" />
                <div className="p-2">
                  <Skeleton className="h-3 w-full mb-1" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-8" />
                    <Skeleton className="h-2.5 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

