import { NewsBlogCard } from "@/components/blog/news-blog-card"
import { NewsBlogSkeleton } from "@/components/blog/news-blog-skeleton"
import { BlogEmptyState } from "@/components/blog/blog-empty-state"
import { Button } from "@/components/ui/button"
import { useGetBlogPosts } from "@/services/blog"
import { ArrowRight, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"

interface ArtistBlogPreviewProps {
    authorId: string
    authorName?: string
    limit?: number
    published?: boolean
    status?: string
    showHeader?: boolean
    className?: string
}

export function ArtistBlogPreview({
    authorId,
    authorName,
    limit = 4,
    published,
    status,
    showHeader = true,
    className = "",
}: ArtistBlogPreviewProps) {
    const { data, isLoading } = useGetBlogPosts({
        authorId,
        limit,
        sortBy: "publishedAt",
        sortOrder: "desc",
        ...(published !== undefined && { published }),
        ...(status !== undefined && { status }),
    })

    const posts = data?.data ?? []
    const total = data?.total ?? 0
    const heroPost = posts[0]
    const sidePosts = posts.slice(1, limit)
    const blogPageUrl = `/blog?authorId=${authorId}`

    if (isLoading) {
        return (
            <section className={className}>
                {showHeader && (
                    <div className="mb-10 border-gray-200 border-b pb-6">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                        <div className="mt-3 h-8 w-48 animate-pulse rounded bg-gray-100" />
                    </div>
                )}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-8">
                        <NewsBlogSkeleton layout="HERO" />
                    </div>
                    <div className="space-y-0 divide-y divide-gray-100 lg:col-span-4">
                        <NewsBlogSkeleton layout="COMPACT" />
                        <NewsBlogSkeleton layout="COMPACT" />
                        <NewsBlogSkeleton layout="COMPACT" />
                    </div>
                </div>
            </section>
        )
    }

    if (posts.length === 0) {
        return (
            <section className={className}>
                {showHeader && (
                    <PreviewHeader authorName={authorName} total={0} blogPageUrl={blogPageUrl} />
                )}
                <BlogEmptyState artistName={authorName} />
            </section>
        )
    }

    return (
        <section className={className}>
            {showHeader && (
                <PreviewHeader
                    authorName={authorName}
                    total={total}
                    blogPageUrl={blogPageUrl}
                />
            )}

            {posts.length === 1 ? (
                <NewsBlogCard blogPost={heroPost} layout="HERO" />
            ) : (
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-8">
                        {heroPost && <NewsBlogCard blogPost={heroPost} layout="HERO" />}
                    </div>
                    <div className="lg:col-span-4">
                        <div className="space-y-0 divide-y divide-gray-100 border-gray-100 border-t lg:border-t-0">
                            {sidePosts.map((post) => (
                                <NewsBlogCard
                                    key={post.id}
                                    blogPost={post}
                                    layout="COMPACT"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-12 flex flex-col items-center gap-4 border-gray-100 border-t pt-10 sm:flex-row sm:justify-between">
                <p className="text-center text-gray-500 text-sm sm:text-left">
                    {total > limit ? (
                        <>
                            Showing {Math.min(limit, posts.length)} of{" "}
                            <span className="font-semibold text-gray-900">{total}</span> stories
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-gray-900">{total}</span>{" "}
                            {total === 1 ? "story" : "stories"} published
                        </>
                    )}
                </p>
                <Button
                    asChild
                    variant="outline"
                    className="rounded-none border-gray-900 px-8 font-semibold text-gray-900 text-xs uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white"
                >
                    <Link to={blogPageUrl}>
                        Show all
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}

function PreviewHeader({
    authorName,
    total,
    blogPageUrl,
}: {
    authorName?: string
    total: number
    blogPageUrl: string
}) {
    const title = authorName ? `${authorName}'s Stories` : "Stories"

    return (
        <div className="mb-10 flex flex-col gap-4 border-gray-200 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-red-700" />
                    <span className="font-semibold text-red-700 text-[11px] uppercase tracking-[0.2em]">
                        From the studio
                    </span>
                </div>
                <h2 className="font-black text-3xl text-gray-900 tracking-tight">{title}</h2>
                {total > 0 && (
                    <p className="mt-1 text-gray-500 text-sm">
                        Latest writing, insights, and studio updates
                    </p>
                )}
            </div>
            {total > 0 && (
                <Link
                    to={blogPageUrl}
                    className="inline-flex items-center gap-2 font-black text-red-700 text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-gray-900"
                >
                    View on blog
                    <ArrowRight className="h-3 w-3" />
                </Link>
            )}
        </div>
    )
}
