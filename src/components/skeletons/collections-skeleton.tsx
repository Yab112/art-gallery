import { Skeleton } from "@/components/ui/skeleton"

export function CollectionsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 py-4">
                {/* Header Skeleton */}
                <div className="mb-4 border-gray-200 border-b bg-white py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-16 rounded-md" />
                            <Skeleton className="h-7 w-20 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Collections Grid Skeleton */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-md border border-gray-200 bg-white"
                        >
                            <Skeleton className="h-32 w-full" />
                            <div className="p-3">
                                <Skeleton className="mb-2 h-4 w-full" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-12" />
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-6 w-16" />
                                        <Skeleton className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
