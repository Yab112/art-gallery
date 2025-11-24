import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import type { BlogPost } from "@/types/blog.types";

interface BlogCardProps {
  blogPost: BlogPost;
  returnTo?: string;
  returnState?: any;
}

export function BlogCard({ blogPost, returnTo, returnState }: BlogCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Show relative time for recent posts
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <Link
      to={`/blog/${blogPost.slug}`}
      state={returnTo ? { returnTo, returnState } : undefined}
      className="group block"
    >
      <article className="flex flex-col md:flex-row gap-6 py-8 px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200">
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author & Date */}
          <div className="flex items-center gap-2.5 mb-3 text-sm text-gray-600">
            {blogPost.author?.image ? (
              <img
                src={blogPost.author.image}
                alt={blogPost.author.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-gray-500" />
              </div>
            )}
            <span className="font-medium text-gray-900">{blogPost.author?.name || "Anonymous"}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors line-clamp-2 leading-tight">
            {blogPost.title}
          </h2>

          {/* Excerpt */}
          {blogPost.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-base hidden md:block">
              {blogPost.excerpt}
            </p>
          )}

          {/* Footer - Minimal stats */}
          <div className="flex items-center gap-5 text-sm text-gray-500 mt-3">
            <span>{blogPost.views.toLocaleString()} views</span>
            {blogPost.likes > 0 && <span>{blogPost.likes} likes</span>}
          </div>
        </div>

        {/* Featured Image - Right side on desktop */}
        {blogPost.featuredImage && (
          <div className="flex-shrink-0 w-full md:w-56 h-40 md:h-40 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={blogPost.featuredImage}
              alt={blogPost.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </article>
    </Link>
  );
}

