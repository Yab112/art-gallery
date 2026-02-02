import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSectionSkeleton() {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="mb-4 h-4 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
                ))}
            </div>
        </div>
    )
}
