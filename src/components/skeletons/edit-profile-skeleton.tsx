import { Skeleton } from "@/components/ui/skeleton";

export function EditProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Profile Picture Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>

            {/* Cover Image Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-full h-48 rounded-lg" />
            </div>

            {/* Form Fields Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}

            {/* Bio Textarea Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

