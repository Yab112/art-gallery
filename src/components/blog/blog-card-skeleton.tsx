import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <article className="flex flex-col md:flex-row gap-6 py-8 px-6 border-b border-gray-100 last:border-b-0">
      {/* Content Section */}
      <div className="flex-1 min-w-0">
        {/* Author & Date */}
        <div className="flex items-center gap-2.5 mb-3">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Title */}
        <Skeleton className="h-8 w-full mb-3" />
        <Skeleton className="h-8 w-3/4 mb-4" />

        {/* Excerpt */}
        <Skeleton className="h-4 w-full mb-2 hidden md:block" />
        <Skeleton className="h-4 w-5/6 mb-3 hidden md:block" />

        {/* Footer - Stats */}
        <div className="flex items-center gap-5 mt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Featured Image */}
      <div className="flex-shrink-0 w-full md:w-56 h-40 md:h-40">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    </article>
  );
}












