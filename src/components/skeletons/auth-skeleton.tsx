import { Skeleton } from "@/components/ui/skeleton";

export function AuthSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Left side - Gradient background (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-orange-300"></div>
            <div className="relative z-10 flex items-center justify-center p-12 w-full">
              <div className="text-center text-white space-y-8">
                <Skeleton className="w-12 h-12 mx-auto rounded-full bg-white/20" />
                <div className="space-y-4">
                  <Skeleton className="h-16 w-64 mx-auto bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form skeleton */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative">
            <div className="w-full max-w-md space-y-6">
              <Skeleton className="h-10 w-48 mx-auto" />
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
  );
}

