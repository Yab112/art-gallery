import { Skeleton } from "@/components/ui/skeleton";

export function ArtistDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Artist Profile Skeleton - Matching new layout */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Image Skeleton */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <Skeleton className="w-full h-full" />
            </div>

            {/* Header with Profile Picture and Info Skeleton */}
            <div className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4 -mt-16">
                  {/* Profile Picture Skeleton */}
                  <div className="relative">
                    <Skeleton className="w-20 h-20 rounded-full border-4 border-white shadow-md" />
                  </div>
                  
                  {/* Name and Details Skeleton */}
                  <div className="mt-12 space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex flex-wrap gap-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>

              {/* Bio Skeleton */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="mb-8 flex gap-4 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Filter Controls Skeleton */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Artwork Grid Skeleton */}
        <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="break-inside-avoid space-y-3">
              <Skeleton className="aspect-[4/5] w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Similar Artists Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

