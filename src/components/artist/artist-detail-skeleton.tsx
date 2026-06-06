import { Skeleton } from "@/components/ui/skeleton"

export function ArtistDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── ArtistProfileEnhanced skeleton ── */}
            <div className="mb-12 space-y-4">

                {/* Cover Image - Full Width Black Banner */}
                <div className="px-4">
                    <Skeleton className="relative h-32 w-full sm:h-48" />
                </div>

                {/* Profile Header */}
                <div className="container mx-auto mt-2 max-w-6xl px-4">
                    <div className="mb-6">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                            <div className="flex w-full flex-col items-center space-y-4 sm:flex-row sm:items-end sm:space-x-6 sm:space-y-0">
                                {/* Profile Picture - overlapping cover */}
                                <div className="relative -mt-16 flex w-full flex-shrink-0 justify-center sm:-mt-20 sm:w-auto">
                                    <Skeleton className="h-32 w-32 rounded-full border-[6px] border-white sm:h-48 sm:w-48 sm:border-[8px]" />
                                </div>

                                {/* Name and Details */}
                                <div className="flex flex-col items-center sm:items-start">
                                    {/* Name row */}
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <Skeleton className="h-8 w-48 sm:h-9 sm:w-64" />
                                        <Skeleton className="h-5 w-20 rounded-md" />
                                    </div>
                                    {/* Heat score & views row */}
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    {/* Followers / Following */}
                                    <div className="mt-3 flex items-center gap-4">
                                        <Skeleton className="h-5 w-24" />
                                        <div className="h-4 w-px bg-gray-200" />
                                        <Skeleton className="h-5 w-24" />
                                        {/* Following avatar stack */}
                                        <div className="-space-x-4 ml-2 flex items-center">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-8 w-8 rounded-full border-2 border-white" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Location / website / verified row */}
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (follow / share) */}
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                                <Skeleton className="h-9 w-24 rounded-md" />
                                <Skeleton className="h-9 w-9 rounded-md" />
                                <Skeleton className="h-9 w-9 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Badges row */}
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-6 w-20 rounded-md" />
                        ))}
                    </div>
                </div>

                {/* Main content + sidebar (featured works / techniques / categories / stats) */}
                <div className="container mx-auto mt-8 max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Main area – Featured Works */}
                        <div className="space-y-6 md:col-span-2">
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="mb-6 flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-3">
                                            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar – Techniques / Categories / Stats */}
                        <div className="space-y-6">
                            {/* Techniques */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="mb-3 flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-6 w-16 rounded-full" />
                                    ))}
                                </div>
                            </div>
                            {/* Categories */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="mb-3 flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-6 w-20 rounded-full" />
                                    ))}
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="rounded-md border border-gray-100 bg-white p-6">
                                <div className="flex flex-wrap items-center justify-center gap-6">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Page body (container) skeleton ── */}
            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Back button */}
                <div className="mb-4">
                    <Skeleton className="h-9 w-20 rounded-md" />
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8 flex gap-4 border-b border-gray-200 pb-0">
                    {["Artworks", "About", "Blog", "Collections"].map((tab) => (
                        <div key={tab} className="pb-3">
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>

                {/* Filter Controls */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <Skeleton className="h-9 w-36 rounded-md" />
                    <Skeleton className="h-9 w-36 rounded-md" />
                    <Skeleton className="h-9 w-36 rounded-md" />
                    <Skeleton className="h-9 w-36 rounded-md" />
                </div>

                {/* Artwork Grid */}
                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>

                {/* Similar Artists */}
                <div className="mt-12">
                    <Skeleton className="mb-6 h-6 w-48" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col items-center space-y-2">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
