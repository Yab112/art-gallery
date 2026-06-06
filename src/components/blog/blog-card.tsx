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
            <article className="flex flex-col gap-8 px-6 py-10 transition-all sm:px-8 md:flex-row md:items-start">
                {/* Content Section - Now on the left */}
                <div className="flex flex-1 flex-col">
                    {/* Category Tag - News Style */}
                    <div className="mb-3">
                        <span className="font-bold text-red-700 text-[10px] uppercase tracking-[0.2em]">
                            {blogPost.category || "Inspiration"}
                        </span>
                    </div>

                    {/* Meta Info */}
                    <div className="mb-4 flex items-center gap-3 font-medium text-gray-400 text-xs tracking-tight">
                        <span className="text-gray-900">{blogPost.author?.name || "Art Gallery"}</span>
                        <span className="text-gray-300">|</span>
                        <span>{formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
                    </div>

                    {/* Title */}
                    <h2 className="mb-4 font-bold text-2xl text-gray-900 leading-tight transition-colors group-hover:text-red-700 md:text-4xl">
                        {blogPost.title}
                    </h2>

                    {/* Excerpt */}
                    {blogPost.excerpt && (
                        <p className="mb-6 line-clamp-3 text-gray-600 text-lg leading-relaxed">
                            {blogPost.excerpt}
                        </p>
                    )}

                    {/* Footer Stats */}
                    <div className="flex items-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <span>{blogPost.views.toLocaleString()} views</span>
                        </div>
                        {blogPost.likes > 0 && (
                            <div className="flex items-center gap-2">
                                <span>{blogPost.likes} likes</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured Image - Now on the right */}
                {blogPost.featuredImage && (
                    <div className="aspect-[16/9] w-full flex-shrink-0 overflow-hidden rounded-sm bg-gray-50 md:w-[440px]">
                        <img
                            src={blogPost.featuredImage}
                            alt={blogPost.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
            </article>
            {/* Minimal separator */}
            <div className="h-px w-full bg-gray-100 group-last:hidden" />
        </Link>
    )
}
