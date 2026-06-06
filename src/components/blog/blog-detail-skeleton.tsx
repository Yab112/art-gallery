import { Skeleton } from "@/components/ui/skeleton"

export function BlogDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 border-gray-200 border-b bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32 rounded-none" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-20 rounded-none" />
                            <div className="h-4 w-px bg-gray-100" />
                            <Skeleton className="h-4 w-4 rounded-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Main Content Column */}
                    <article className="lg:col-span-8">
                        {/* News Header */}
                        <header className="mb-10">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <Skeleton className="h-6 w-24 rounded-none" />
                                <Skeleton className="h-6 w-20 rounded-none" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <Skeleton className="h-14 w-full rounded-none" />
                                <Skeleton className="h-14 w-3/4 rounded-none" />
                            </div>

                            <Skeleton className="h-8 w-1/2 rounded-none mb-10" />

                            {/* Author & Meta */}
                            <div className="flex flex-col gap-8 border-gray-100 border-y py-10">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-32 rounded-none" />
                                            <Skeleton className="h-4 w-48 rounded-none" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-center border-gray-100 border-r pr-8">
                                            <Skeleton className="h-6 w-8 mb-1 rounded-none" />
                                            <Skeleton className="h-3 w-12 rounded-none" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Skeleton className="h-6 w-12 mb-1 rounded-none" />
                                            <Skeleton className="h-3 w-10 rounded-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Featured Media */}
                        <Skeleton className="mb-12 aspect-video w-full rounded-none" />

                        {/* Content Body */}
                        <div className="space-y-6">
                            <Skeleton className="h-4 w-full rounded-none" />
                            <Skeleton className="h-4 w-full rounded-none" />
                            <Skeleton className="h-4 w-5/6 rounded-none" />
                            <Skeleton className="h-4 w-full rounded-none" />
                            <Skeleton className="h-4 w-3/4 rounded-none" />
                            <div className="py-4">
                                <Skeleton className="h-10 w-1/3 rounded-none mb-4" />
                                <Skeleton className="h-4 w-full rounded-none" />
                                <Skeleton className="h-4 w-full rounded-none" />
                                <Skeleton className="h-4 w-2/3 rounded-none" />
                            </div>
                            <Skeleton className="h-4 w-full rounded-none" />
                            <Skeleton className="h-4 w-full rounded-none" />
                        </div>
                    </article>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4 lg:border-gray-100 lg:border-l lg:pl-12">
                        <div className="space-y-12">
                            {/* Featured Artist Skeleton */}
                            <div className="rounded-none bg-gray-50 p-6">
                                <Skeleton className="h-4 w-32 mb-6 rounded-none" />
                                <div className="flex items-center gap-4 mb-6">
                                    <Skeleton className="h-16 w-16 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-24 rounded-none" />
                                        <Skeleton className="h-3 w-32 rounded-none" />
                                    </div>
                                </div>
                                <Skeleton className="h-12 w-full rounded-none" />
                            </div>

                            {/* Shop the Story Skeleton */}
                            <div>
                                <Skeleton className="h-4 w-32 mb-6 rounded-none" />
                                <div className="space-y-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="h-20 w-20 flex-shrink-0 rounded-none" />
                                            <div className="flex flex-col justify-center flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full rounded-none" />
                                                <Skeleton className="h-4 w-1/2 rounded-none" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
