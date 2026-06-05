import { Skeleton } from "@/components/ui/skeleton"

export function PublicCollectionsSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Skeleton className="mb-2 h-3 w-16" />
                        <Skeleton className="h-9 w-48 sm:h-10" />
                        <Skeleton className="mt-2 h-4 w-28" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32 rounded-full" />
                        <Skeleton className="h-10 w-40 rounded-full" />
                    </div>
                </div>

                <section className="mb-10">
                    <Skeleton className="mb-4 h-6 w-44" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-80 shrink-0">
                                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-20 rounded-full" />
                            <Skeleton className="h-9 w-20 rounded-full" />
                        </div>
                    </div>

                    <div className="mb-3 flex gap-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-6 w-24 rounded-full" />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="overflow-hidden rounded-xl ring-1 ring-gray-200/80">
                                <Skeleton className="aspect-[4/3] w-full" />
                                <div className="space-y-2 p-4">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
