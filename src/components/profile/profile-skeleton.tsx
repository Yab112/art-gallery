import { Skeleton } from "@/components/ui/skeleton"
import { ArtworkCardSkeleton } from "@/components/skeletons/artwork-card-skeleton"

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen pb-12 bg-gray-50">
            {/* Cover Image - Full Width Banner Skeleton */}
            <div className="px-4">
                <Skeleton className="h-32 w-full bg-gray-200 sm:h-48 rounded-none" />
            </div>

            <div className="container mx-auto mt-2 max-w-6xl px-4">
                {/* Profile Header Skeleton */}
                <div className="mb-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
                            {/* Avatar Skeleton */}
                            <div className="relative -mt-16 sm:-mt-20">
                                <Skeleton className="h-32 w-32 rounded-full border-[6px] border-white sm:h-48 sm:w-48 sm:border-[8px]" />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-3">
                                {/* Name */}
                                <Skeleton className="h-9 w-48 sm:h-10 sm:w-64 mx-auto sm:mx-0" />
                                
                                {/* Heat Score and Views */}
                                <div className="mt-2 flex flex-wrap justify-center gap-4 sm:justify-start">
                                    <Skeleton className="h-5 w-28" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                
                                {/* Stats / Followers */}
                                <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                            <Skeleton className="h-10 flex-1 sm:w-32 sm:flex-none" />
                            <Skeleton className="h-10 w-10" />
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs Skeleton */}
                <div className="mb-8 border-gray-200 border-b">
                    <div className="flex space-x-1 sm:space-x-8 py-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>

                {/* Profile Information Tab Content (Artworks Tab by default) */}
                <div className="space-y-6">
                    {/* Filter Controls Skeleton */}
                    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-10 w-28 rounded-full" />
                            <Skeleton className="h-10 w-28 rounded-full" />
                            <Skeleton className="h-10 w-20 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-28 rounded-full" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-44 rounded-full" />
                        </div>
                    </div>

                    {/* Artwork Grid Skeleton */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <ArtworkCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
