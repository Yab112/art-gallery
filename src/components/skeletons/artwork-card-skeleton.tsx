import { Skeleton } from "@/components/ui/skeleton"

export function ArtworkCardSkeleton() {
    return (
        <div className="group relative">
            <Skeleton className="mb-4 aspect-[4/5] w-full rounded-none bg-gray-100" />

            <div className="space-y-2">
                <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-4 min-w-0 flex-1" />
                    <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}
