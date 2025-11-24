import { useGetBlogPosts } from "@/services/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { Loader2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UserBlogsProps {
  userId: string;
  limit?: number;
}

export function UserBlogs({ userId, limit = 6 }: UserBlogsProps) {
  const { data, isLoading } = useGetBlogPosts({
    authorId: userId,
    published: true,
    limit,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  if (isLoading) {
    return (
      <section className="py-8 border-t border-gray-200 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Blog Posts by This Artist</h2>
          </div>
        </div>
        <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.data.length === 0) {
    return null;
  }

  return (
    <section className="py-8 border-t border-gray-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Blog Posts by This Artist</h2>
        </div>
        <Link to={`/blog?authorId=${userId}`}>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {/* Blog List - Medium Style */}
      <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {data.data.map((post) => (
          <BlogCard key={post.id} blogPost={post} />
        ))}
      </div>
    </section>
  );
}

