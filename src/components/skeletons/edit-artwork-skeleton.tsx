import { Skeleton } from "@/components/ui/skeleton"

export function EditArtworkSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                            <Skeleton className="mb-2 h-8 w-40" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>

                {/* Form Skeleton */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="space-y-8">
                        {/* Alert Skeleton */}
                        <Skeleton className="h-16 w-full rounded-md" />

                        {/* Form Sections Skeleton */}
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {[1, 2, 3, 4].map((j) => (
                                        <div key={j} className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Action Buttons Skeleton */}
                        <div className="flex justify-end gap-4 pt-6">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
