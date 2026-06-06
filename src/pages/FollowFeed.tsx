import { ArtworkCard } from "@/components/artwork-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { PaginationControls } from "@/components/ui/pagination-controls"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useGetFeed } from "@/services/feed/useGetFeed"
import { getAvatarUrl } from "@/utils/avatar"
import { Eye, Heart, Loader2, Users } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function FollowFeedPage() {
    const [page, setPage] = useState(1)
    const [type, setType] = useState<"all" | "artworks" | "blog_posts">("all")
    const limit = 20

    const { data, isLoading, error } = useGetFeed(page, limit, type)

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="container mx-auto px-4 py-8">
                    <EmptyState
                        icon={Users}
                        title="Error Loading Feed"
                        description="Failed to load your feed. Please try again later."
                    />
                </div>
            </ProtectedRoute>
        )
    }

    const items = data?.items || []
    const totalPages = data?.totalPages || 0

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto max-w-6xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="font-bold text-3xl text-gray-900">Your Feed</h1>
                            <p className="mt-2 text-gray-600">Latest from users you follow</p>
                        </div>
                        <Select
                            value={type}
                            onValueChange={(v) => {
                                setType(v as "all" | "artworks" | "blog_posts")
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Content</SelectItem>
                                <SelectItem value="artworks">Artworks Only</SelectItem>
                                <SelectItem value="blog_posts">Blog Posts Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Feed Items */}
                    {items.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No Content Yet"
                            description="Start following users to see their artworks and blog posts in your feed."
                        />
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                                >
                                    {item.type === "artwork" && item.artwork && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-3">
                                                <Link to={`/profile/${item.artwork.user.id}`}>
                                                    <img
                                                        src={getAvatarUrl(
                                                            item.artwork.user.image,
                                                            item.artwork.user.name,
                                                            40
                                                        )}
                                                        alt={item.artwork.user.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                </Link>
                                                <div>
                                                    <Link
                                                        to={`/profile/${item.artwork.user.id}`}
                                                        className="font-semibold text-gray-900 hover:text-red-600"
                                                    >
                                                        {item.artwork.user.name}
                                                    </Link>
                                                    <p className="text-gray-500 text-sm">
                                                        posted an artwork
                                                    </p>
                                                </div>
                                            </div>
                                            <Link to={`/artwork/${item.artwork.id}`}>
                                                <ArtworkCard
                                                    id={item.artwork.id}
                                                    image={
                                                        item.artwork.photos[0] || "/placeholder.svg"
                                                    }
                                                    title={item.artwork.title || "Untitled"}
                                                    artist={item.artwork.artist}
                                                    price={`$${item.artwork.desiredPrice.toLocaleString()}`}
                                                    year="N/A"
                                                    medium="N/A"
                                                    dimensions="N/A"
                                                    seller={item.artwork.user.name}
                                                    status={item.artwork.status as any}
                                                />
                                            </Link>
                                        </div>
                                    )}

                                    {item.type === "blog_post" && item.blogPost && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-3">
                                                <Link to={`/profile/${item.blogPost.author.id}`}>
                                                    <img
                                                        src={getAvatarUrl(
                                                            item.blogPost.author.image,
                                                            item.blogPost.author.name,
                                                            40
                                                        )}
                                                        alt={item.blogPost.author.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                </Link>
                                                <div>
                                                    <Link
                                                        to={`/profile/${item.blogPost.author.id}`}
                                                        className="font-semibold text-gray-900 hover:text-red-600"
                                                    >
                                                        {item.blogPost.author.name}
                                                    </Link>
                                                    <p className="text-gray-500 text-sm">
                                                        published a blog post
                                                    </p>
                                                </div>
                                            </div>
                                            <Link to={`/blog/${item.blogPost.slug}`}>
                                                <div className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                                                    {item.blogPost.featuredImage && (
                                                        <img
                                                            src={item.blogPost.featuredImage}
                                                            alt={item.blogPost.title}
                                                            className="h-48 w-full object-cover"
                                                        />
                                                    )}
                                                    <div className="p-4">
                                                        <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                                                            {item.blogPost.title}
                                                        </h3>
                                                        {item.blogPost.excerpt && (
                                                            <p className="mb-4 text-gray-600">
                                                                {item.blogPost.excerpt}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>{item.blogPost.views}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="h-4 w-4" />
                                                                <span>{item.blogPost.likes}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <PaginationControls
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    className="mt-6"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
