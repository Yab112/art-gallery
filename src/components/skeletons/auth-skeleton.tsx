import { Skeleton } from "@/components/ui/skeleton"

export function AuthSkeleton() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative mx-4 w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex min-h-[600px]">
                    {/* Left side - Gradient background (hidden on mobile) */}
                    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-orange-300" />
                        <div className="relative z-10 flex w-full items-center justify-center p-12">
                            <div className="space-y-8 text-center text-white">
                                <Skeleton className="mx-auto h-12 w-12 rounded-full bg-white/20" />
                                <div className="space-y-4">
                                    <Skeleton className="mx-auto h-16 w-64 bg-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Auth form skeleton */}
                    <div className="relative flex flex-1 items-center justify-center bg-gray-50 p-8">
                        <div className="w-full max-w-md space-y-6">
                            <Skeleton className="mx-auto h-10 w-48" />
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <div className="flex items-center justify-center gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
