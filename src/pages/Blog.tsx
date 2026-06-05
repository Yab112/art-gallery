import { BlogCard } from "@/components/blog/blog-card"
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton"
import { BlogFilters } from "@/components/blog/blog-filters"
import { CreateBlogModal } from "@/components/blog/create-blog-modal"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useGetBlogPosts } from "@/services/blog"
import { BookOpen, Plus, Sparkles, User } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

export default function BlogPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { user } = useAuth()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Fix for Radix UI Select dropdown page shift issue
    useEffect(() => {
        const styleId = "prevent-select-margin-blog-page"
        let styleElement = document.getElementById(styleId) as HTMLStyleElement

        if (!styleElement) {
            styleElement = document.createElement("style")
            styleElement.id = styleId
            styleElement.textContent = `
        body[data-scroll-locked],
        html[data-scroll-locked],
        body[data-radix-scroll-lock],
        html[data-radix-scroll-lock] {
          margin-right: 0 !important;
          margin-left: 0 !important;
          padding-right: 0 !important;
          padding-left: 0 !important;
        }
      `
            document.head.appendChild(styleElement)
        }

        const interval = setInterval(() => {
            const body = document.body
            const html = document.documentElement
            body.style.setProperty("margin-right", "0", "important")
            body.style.setProperty("padding-right", "0", "important")
            html.style.setProperty("margin-right", "0", "important")
            html.style.setProperty("padding-right", "0", "important")
        }, 16)

        return () => {
            clearInterval(interval)
        }
    }, [])

    // Get filter values from URL
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)
    const searchQuery = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const authorId = searchParams.get("authorId") || ""

    // Update URL params
    const updateParams = (updates: Record<string, string | number | null>) => {
        const newParams = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                newParams.delete(key)
            } else {
                newParams.set(key, String(value))
            }
        })
        setSearchParams(newParams, { replace: true })
    }

    // Fetch blog posts
    const { data, isLoading, error } = useGetBlogPosts({
        page,
        limit,
        published: true,
        search: searchQuery || undefined,
        authorId: authorId || undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as "asc" | "desc"
    })

    // Extract unique authors from blog posts
    const authors = Array.from(
        new Map(
            data?.data.filter((post) => post.author).map((post) => [post.author!.id, post.author!])
        ).values()
    )

    const handleSearchChange = (query: string) => {
        updateParams({ search: query || null, page: 1 })
    }

    const handleSortChange = (value: string) => {
        updateParams({ sortBy: value, page: 1 })
    }

    const handleSortOrderChange = (value: string) => {
        updateParams({ sortOrder: value, page: 1 })
    }

    const handleAuthorChange = (value: string) => {
        updateParams({ authorId: value || null, page: 1 })
    }

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleLimitChange = (newLimit: string) => {
        updateParams({ limit: Number.parseInt(newLimit, 10), page: 1 })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mb-4 flex items-center justify-center gap-3">
                            <BookOpen className="h-12 w-12" />
                            <Sparkles className="h-8 w-8 text-yellow-300" />
                        </div>
                        <h1 className="mb-4 font-bold text-5xl">Art & Inspiration Blog</h1>
                        <p className="mx-auto mb-6 max-w-2xl text-red-100 text-xl">
                            Discover stories, insights, and inspiration from the world of art.
                            Explore our curated collection of articles, artist features, and
                            creative journeys.
                        </p>
                        {user && (
                            <Link to="/blog/my-blogs">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="bg-white text-red-700 hover:bg-gray-100"
                                >
                                    <User className="mr-2 h-5 w-5" />
                                    My Blogs
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Create Blog Button or Sign in CTA */}
                {user ? (
                    <div className="mb-6 flex justify-end">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Blog Post
                        </Button>
                        <CreateBlogModal
                            isOpen={isCreateModalOpen}
                            onClose={() => setIsCreateModalOpen(false)}
                        />
                    </div>
                ) : (
                    <div className="mb-6 flex justify-end">
                        <Link to={`/login?redirect=${encodeURIComponent("/blog")}`}>
                            <Button variant="outline" className="rounded-full">
                                Sign in to create a post
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-8">
                            <BlogFilters
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                sortBy={sortBy}
                                onSortChange={handleSortChange}
                                sortOrder={sortOrder}
                                onSortOrderChange={handleSortOrderChange}
                                authorId={authorId}
                                onAuthorChange={handleAuthorChange}
                                authors={authors}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="max-w-4xl lg:col-span-3">
                        {isLoading ? (
                            <div className="mb-8 space-y-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                {[...Array(6)].map((_, i) => (
                                    <BlogCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                                <p className="text-red-800">
                                    Failed to load blog posts. Please try again.
                                </p>
                            </div>
                        ) : !data || data.data.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
                                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                                    No blog posts found
                                </h3>
                                <p className="text-gray-600">
                                    {searchQuery
                                        ? "Try adjusting your search or filters."
                                        : "Check back soon for new articles!"}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Results Count and Page Size Selector */}
                                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <p className="text-gray-600">
                                        Showing{" "}
                                        <span className="font-semibold text-gray-900">
                                            {data.data.length > 0 ? (page - 1) * data.limit + 1 : 0}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min(page * data.limit, data.total)}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold text-gray-900">
                                            {data.total}
                                        </span>{" "}
                                        posts
                                        {data.totalPages > 1 && (
                                            <span className="ml-2 text-gray-500">
                                                (Page {page} of {data.totalPages})
                                            </span>
                                        )}
                                    </p>

                                    {/* Page Size Selector */}
                                    <div className="flex items-center gap-2">
                                        <label
                                            htmlFor="page-size"
                                            className="whitespace-nowrap text-gray-600 text-sm"
                                        >
                                            Show per page:
                                        </label>
                                        <Select
                                            value={limit.toString()}
                                            onValueChange={handleLimitChange}
                                        >
                                            <SelectTrigger id="page-size" className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6">6</SelectItem>
                                                <SelectItem value="12">12</SelectItem>
                                                <SelectItem value="24">24</SelectItem>
                                                <SelectItem value="36">36</SelectItem>
                                                <SelectItem value="48">48</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Blog Posts List - Medium Style */}
                                <div className="mb-8 space-y-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                    {data.data.map((post, index) => (
                                        <BlogCard key={post.id} blogPost={post} />
                                    ))}
                                </div>

                                {/* Pagination - Always show if there are posts */}
                                {data && data.total > 0 && (
                                    <PaginationControls
                                        currentPage={page}
                                        totalPages={data.totalPages}
                                        onPageChange={handlePageChange}
                                        totalItems={data.total}
                                        itemLabel="posts"
                                        itemLabelSingular="post"
                                        showSinglePageSummary
                                    />
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
