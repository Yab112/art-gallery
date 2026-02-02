import { Skeleton } from "@/components/ui/skeleton"

export function OrdersSkeleton() {
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
                                    <Skeleton className="mb-2 h-8 w-32" />
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
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex flex-col gap-6 md:flex-row">
                                {/* Artwork Image Skeleton */}
                                <Skeleton className="h-32 w-32 flex-shrink-0 rounded-lg md:h-40 md:w-40" />

                                {/* Order Details Skeleton */}
                                <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row">
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
                                        <div className="space-y-1 text-right">
                                            <Skeleton className="ml-auto h-3 w-12" />
                                            <Skeleton className="ml-auto h-8 w-24" />
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
    )
}
