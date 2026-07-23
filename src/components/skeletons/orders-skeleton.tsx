import { Skeleton } from "@/components/ui/skeleton"

export function OrdersSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50/50">
            <div className="container mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="mt-2 h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-md" />
                </div>

                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-20" />
                            </div>

                            <div className="flex gap-3">
                                <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/3" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>

                            <Skeleton className="mt-3 h-16 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
