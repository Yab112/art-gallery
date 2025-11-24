import { Skeleton } from "@/components/ui/skeleton";

export function MyArtworksSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 py-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
        </div>

        {/* Artworks Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="relative">
              <Skeleton className="aspect-[4/5] w-full rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
                <Skeleton className="h-7 w-7 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

