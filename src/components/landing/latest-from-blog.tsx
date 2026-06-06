import { useGetBlogPosts } from "@/services/blog";
import { NewsBlogCard } from "../blog/news-blog-card";
import { NewsBlogSkeleton } from "../blog/news-blog-skeleton";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function LatestFromBlog() {
  const { data: blogPosts, isLoading } = useGetBlogPosts({
    limit: 4,
    published: true,
    sortBy: "views",
    sortOrder: "desc",
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="font-black text-3xl text-gray-900 uppercase tracking-tighter md:text-5xl">
              The Art Journal
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <NewsBlogSkeleton key={i} layout="STANDARD" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!blogPosts || blogPosts.data.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="block font-bold text-red-700 text-xs uppercase tracking-[0.3em] mb-4">
              Insights & Stories
            </span>
            <h2 className="font-bold text-4xl text-gray-900 uppercase tracking-tighter md:text-6xl">
              Most Read on the Journal
            </h2>
          </div>
          <Link to="/blog">
            <Button
              variant="outline"
              className="h-14 rounded-none border-2 border-black px-8 font-black text-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white"
            >
              Explore All Stories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {blogPosts.data.map((post) => (
            <NewsBlogCard key={post.id} blogPost={post} layout="STANDARD" />
          ))}
        </div>
      </div>
    </section>
  );
}
