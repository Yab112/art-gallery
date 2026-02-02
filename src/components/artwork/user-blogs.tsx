import { BlogCard } from "@/components/blog/blog-card"
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useGetBlogPosts } from "@/services/blog"
import { BookOpen, FolderOpen } from "lucide-react"
import { Link } from "react-router-dom"

interface UserBlogsProps {
    userId: string
    limit?: number
}

export function UserBlogs({ userId, limit = 6 }: UserBlogsProps) {
    const { data, isLoading } = useGetBlogPosts({
        authorId: userId,
        published: true,
        limit,
        sortBy: "publishedAt",
        sortOrder: "desc"
    })

    if (isLoading) {
        return (
            <section className="mt-8 border-gray-200 border-t py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-700" />
                        <h2 className="font-bold text-gray-900 text-xl">
                            Blog Posts by This Artist
                        </h2>
                    </div>
                </div>
                <div className="space-y-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {[...Array(3)].map((_, i) => (
                        <BlogCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        )
    }

    const hasBlogs = data && data.data.length > 0

    return (
        <section className="mt-8 border-gray-200 border-t py-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-700" />
                    <h2 className="font-bold text-gray-900 text-xl">Blog Posts by This Artist</h2>
                </div>
                {hasBlogs && (
                    <Link to={`/blog?authorId=${userId}`}>
                        <Button variant="ghost" size="sm">
                            View All
                        </Button>
                    </Link>
                )}
            </div>

            {hasBlogs ? (
                /* Blog List - Medium Style */
                <div className="space-y-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                    {data.data.map((post) => (
                        <BlogCard key={post.id} blogPost={post} />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="rounded-lg border border-gray-200 bg-white p-8">
                    <EmptyState
                        icon={FolderOpen}
                        title="No Blog Posts Yet"
                        description="This artist hasn't published any blog posts yet."
                    />
                </div>
            )}
        </section>
    )
}
