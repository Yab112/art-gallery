import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div>
                                <Skeleton className="mb-2 h-8 w-32" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {/* Sidebar Navigation Skeleton */}
                    <div className="md:col-span-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="space-y-2">
                                <Skeleton className="mb-4 h-4 w-16" />
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                                <Skeleton className="my-3 h-px w-full" />
                                <Skeleton className="mb-4 h-4 w-24" />
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="md:col-span-3">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Skeleton className="mb-6 h-7 w-48" />
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
