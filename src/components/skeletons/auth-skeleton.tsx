import { Skeleton } from "@/components/ui/skeleton"

export function AuthSkeleton() {
    return (
        <div className="flex min-h-svh w-full overflow-hidden bg-white lg:flex">
            <div className="relative hidden h-full w-[62%] bg-[#f3f2ef] lg:block">
                <div className="absolute inset-0 flex gap-6 px-12 py-6">
                    {[0, 1, 2].map((column) => (
                        <div key={column} className="flex flex-1 flex-col gap-6 pt-12">
                            {[0, 1, 2].map((item) => (
                                <Skeleton
                                    key={item}
                                    className="aspect-[3/4] w-full rounded-sm bg-gray-200/80"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex min-h-svh flex-1 flex-col bg-white p-6 lg:p-16">
                <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-4 w-full max-w-xs" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    )
}
