import { Skeleton } from "@/components/ui/skeleton"

export function BlogDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 border-gray-200 border-b bg-white">
                <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>

            <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Featured Image */}
                <Skeleton className="mb-8 h-[400px] w-full rounded-lg" />

                {/* Header */}
                <header className="mb-8">
                    {/* Title */}
                    <Skeleton className="mb-4 h-12 w-full" />
                    <Skeleton className="mb-6 h-12 w-3/4" />

                    {/* Meta Info */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 border-gray-200 border-t pt-4">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </header>

                {/* Content */}
                <div className="mb-12 rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-5/6" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-4/5" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Comments Section */}
                <section className="mt-16 border-gray-200 border-t pt-12">
                    <Skeleton className="mb-6 h-8 w-48" />

                    {/* Comment Form */}
                    <Skeleton className="mb-4 h-24 w-full rounded-lg" />
                    <Skeleton className="mb-8 h-10 w-32" />

                    {/* Comments List */}
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="mb-2 h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </div>
    )
}
