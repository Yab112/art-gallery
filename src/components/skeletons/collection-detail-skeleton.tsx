import { Skeleton } from "@/components/ui/skeleton";

export function CollectionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Cover Image Section Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <Skeleton className="w-full h-48 md:h-64" />
          
          {/* Collection Name Section Skeleton */}
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Newspaper Style Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Left Column: Description Skeleton */}
          <div className="lg:col-span-1">
            <div className="border-l-2 border-gray-200 pl-4 py-2">
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* Right Column: Featured Artworks Skeleton */}
          <div className="lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <div className="flex justify-end gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-1/3 aspect-[4/5]" />
              ))}
            </div>
          </div>
        </div>

        {/* All Artworks Grid Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

