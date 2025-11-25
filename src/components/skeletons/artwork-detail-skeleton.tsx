import { Skeleton } from "@/components/ui/skeleton";

export function ArtworkDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Left Column - Artwork Image */}
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
              <Skeleton className="h-32 w-full rounded-md" />
            </div>

            {/* Right Column - Artwork Details */}
            <div className="space-y-3">
              {/* Title and Artist */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>

              {/* Price */}
              <Skeleton className="h-10 w-32" />

              {/* Purchase Section */}
              <div className="border border-gray-200 rounded-md p-4 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Collapsible Sections */}
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              {/* Gallery Info */}
              <div className="border border-gray-200 rounded-md p-4 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Related Artworks */}
          <div className="mt-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

