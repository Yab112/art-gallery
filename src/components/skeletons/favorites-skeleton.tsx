import { Skeleton } from "@/components/ui/skeleton"

export function FavoritesSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div>
                                    <Skeleton className="mb-2 h-8 w-40" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-36 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Favorites Grid Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                        >
                            <Skeleton className="aspect-[4/5] w-full" />
                            <div className="space-y-3 p-4">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-6 w-24" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <Skeleton className="h-9 w-full rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
