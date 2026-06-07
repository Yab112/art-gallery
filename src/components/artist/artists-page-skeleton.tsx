import { Skeleton } from "@/components/ui/skeleton"

export function ArtistsPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Header Skeleton */}
            <div className="bg-red-700">
                <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-64 bg-red-600/50" />
                            <Skeleton className="h-6 w-96 bg-red-600/50" />
                            <div className="mt-4 flex items-center gap-4">
                                <Skeleton className="h-5 w-24 bg-red-600/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Filters Section Skeleton */}
                <div className="mb-8 flex flex-wrap items-center gap-3 border-gray-200 border-b pb-4">
                    <Skeleton className="h-9 flex-1 min-w-[150px]" />
                    <Skeleton className="h-9 flex-1 min-w-[150px]" />
                    <Skeleton className="h-9 w-[140px]" />
                    <Skeleton className="h-9 w-[140px]" />
                </div>

                {/* Top Selling Artists Skeleton */}
                <div className="mb-12">
                    <div className="mb-6 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ArtistCardSkeleton key={`top-${i}`} />
                        ))}
                    </div>
                </div>

                {/* All Artists Skeleton */}
                <div className="mb-12">
                    <div className="mb-6 space-y-2">
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <ArtistCardSkeleton key={`all-${i}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ArtistCardSkeleton() {
    return (
        <div className="flex flex-col items-center p-4">
            {/* Avatar Skeleton */}
            <div className="relative mb-3">
                <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28 md:h-32 md:w-32" />
            </div>

            {/* Name Skeleton */}
            <div className="mb-2 w-full flex justify-center">
                <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Email Skeleton */}
            <div className="mb-2 w-full flex justify-center">
                <Skeleton className="h-4 w-1/2 opacity-60" />
            </div>

            {/* Stats Skeleton */}
            <div className="mb-3 flex justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-10" />
                </div>
            </div>

            {/* Talent Types Skeleton */}
            <div className="flex justify-center gap-1.5">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
    )
}

