import { Skeleton } from "@/components/ui/skeleton"

export function BlogCardSkeleton() {
    return (
        <article className="flex flex-col gap-6 border-gray-100 border-b px-6 py-8 last:border-b-0 md:flex-row">
            {/* Content Section */}
            <div className="min-w-0 flex-1">
                {/* Author & Date */}
                <div className="mb-3 flex items-center gap-2.5">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Title */}
                <Skeleton className="mb-3 h-8 w-full" />
                <Skeleton className="mb-4 h-8 w-3/4" />

                {/* Excerpt */}
                <Skeleton className="mb-2 hidden h-4 w-full md:block" />
                <Skeleton className="mb-3 hidden h-4 w-5/6 md:block" />

                {/* Footer - Stats */}
                <div className="mt-3 flex items-center gap-5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>

            {/* Featured Image */}
            <div className="h-40 w-full flex-shrink-0 md:h-40 md:w-56">
                <Skeleton className="h-full w-full rounded-lg" />
            </div>
        </article>
    )
}
