import { Skeleton } from "@/components/ui/skeleton"

export function CollectionDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Cover Image Section Skeleton */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <Skeleton className="h-48 w-full md:h-64" />

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
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left Column: Description Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="border-gray-200 border-l-2 py-2 pl-4">
                            <Skeleton className="mb-3 h-4 w-24" />
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
                                <Skeleton key={i} className="aspect-[4/5] w-1/3" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* All Artworks Grid Skeleton */}
                <div className="mb-4">
                    <Skeleton className="mb-3 h-6 w-32" />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="aspect-[4/5] w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
