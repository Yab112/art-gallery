import type { BlogPost } from "@/types/blog.types"
import { User } from "lucide-react"
import { Link } from "react-router-dom"

interface BlogCardProps {
    blogPost: BlogPost
    returnTo?: string
    returnState?: any
}

export function BlogCard({ blogPost, returnTo, returnState }: BlogCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        // Show relative time for recent posts
        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
        })
    }

    return (
        <Link
            to={`/blog/${blogPost.slug}`}
            state={returnTo ? { returnTo, returnState } : undefined}
            className="group block"
        >
            <article className="flex flex-col gap-6 border-gray-100 border-b px-6 py-8 transition-colors duration-200 last:border-b-0 hover:bg-gray-50/50 md:flex-row">
                {/* Content Section */}
                <div className="min-w-0 flex-1">
                    {/* Author & Date */}
                    <div className="mb-3 flex items-center gap-2.5 text-gray-600 text-sm">
                        {blogPost.author?.image ? (
                            <img
                                src={blogPost.author.image}
                                alt={blogPost.author.name}
                                className="h-7 w-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300">
                                <User className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                        )}
                        <span className="font-medium text-gray-900">
                            {blogPost.author?.name || "Anonymous"}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">
                            {formatDate(blogPost.publishedAt || blogPost.createdAt)}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="mb-3 line-clamp-2 font-bold text-2xl text-gray-900 leading-tight transition-colors group-hover:text-red-700 md:text-3xl">
                        {blogPost.title}
                    </h2>

                    {/* Excerpt */}
                    {blogPost.excerpt && (
                        <p className="mb-4 line-clamp-2 hidden text-base text-gray-600 leading-relaxed md:block">
                            {blogPost.excerpt}
                        </p>
                    )}

                    {/* Footer - Minimal stats */}
                    <div className="mt-3 flex items-center gap-5 text-gray-500 text-sm">
                        <span>{blogPost.views.toLocaleString()} views</span>
                        {blogPost.likes > 0 && <span>{blogPost.likes} likes</span>}
                    </div>
                </div>

                {/* Featured Image - Right side on desktop */}
                {blogPost.featuredImage && (
                    <div className="h-40 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-40 md:w-56">
                        <img
                            src={blogPost.featuredImage}
                            alt={blogPost.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                )}
            </article>
        </Link>
    )
}
