import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface NewsBlogSkeletonProps {
    layout?: "HERO" | "STANDARD" | "COMPACT" | "LINK_ONLY" | "TEXT_ONLY" | "SIDEBAR" | "OVERLAY"
    className?: string
}

export function NewsBlogSkeleton({ layout = "STANDARD", className }: NewsBlogSkeletonProps) {
    if (layout === "HERO") {
        return (
            <div className={cn("flex flex-col gap-6", className)}>
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        )
    }

    if (layout === "COMPACT") {
        return (
            <div className={cn("flex flex-col gap-4 py-6", className)}>
                <Skeleton className="aspect-video w-full rounded-none" />
                <Skeleton className="h-6 w-full" />
            </div>
        )
    }

    if (layout === "LINK_ONLY") {
        return (
            <div className={cn("py-3", className)}>
                <Skeleton className="h-5 w-full" />
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}
