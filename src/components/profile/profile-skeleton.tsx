import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Cover Image Skeleton */}
                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <Skeleton className="h-48 w-full" />

                    {/* Header Skeleton */}
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="-mt-16 flex items-center space-x-4">
                                {/* Avatar Skeleton */}
                                <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />

                                <div className="mt-12 space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                    <Skeleton className="mt-2 h-6 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>

                {/* Profile Information Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Account Information Skeleton */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Skeleton className="mb-4 h-6 w-48" />
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-40" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* My Artworks Skeleton */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-9 w-32" />
                            </div>
                            <Skeleton className="mb-4 h-4 w-64" />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>

                        {/* My Collections Skeleton */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-9 w-36" />
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden rounded-lg border border-gray-200"
                                    >
                                        <Skeleton className="h-48 w-full" />
                                        <div className="space-y-3 p-4">
                                            <Skeleton className="h-5 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex gap-2 pt-3">
                                                <Skeleton className="h-8 flex-1" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* Quick Actions Skeleton */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Skeleton className="mb-4 h-6 w-32" />
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>

                        {/* Account Stats Skeleton */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <Skeleton className="mb-4 h-6 w-32" />
                            <div className="space-y-3">
                                <div>
                                    <Skeleton className="mb-2 h-4 w-16" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                                <div>
                                    <Skeleton className="mb-2 h-4 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
