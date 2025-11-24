import { Skeleton } from "@/components/ui/skeleton";

export function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>

        {/* Orders List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Artwork Image Skeleton */}
                <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-lg flex-shrink-0" />

                {/* Order Details Skeleton */}
                <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <div className="text-right space-y-1">
                      <Skeleton className="h-3 w-12 ml-auto" />
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </div>
                    <Skeleton className="h-9 w-32 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

