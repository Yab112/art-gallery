import { BlogCard } from "@/components/blog/blog-card"
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton"
import { CreateBlogModal } from "@/components/blog/create-blog-modal"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { MyBlogsFilters } from "@/components/blog/my-blogs-filters"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import useAxiosAuth from "@/hooks/use-axios-auth"
import { useGetBlogPosts } from "@/services/blog"
import { useDeleteBlogPost, usePublishBlogPost, useUnpublishBlogPost } from "@/services/blog"
import type { BlogPost } from "@/types/blog.types"
import {
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    Edit,
    Eye,
    MoreVertical,
    Share2,
    ThumbsDown,
    ThumbsUp,
    Trash2
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function MyBlogsPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams()
    const axiosAuth = useAxiosAuth()
    const [metricsDialogOpen, setMetricsDialogOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)

    // AGGRESSIVE cleanup - continuously monitor and remove stuck overlays
    useEffect(() => {
        const interval = setInterval(() => {
            if (!metricsDialogOpen) {
                // Remove any closed overlays
                document
                    .querySelectorAll('[data-radix-dialog-overlay][data-state="closed"]')
                    .forEach((el) => {
                        el.remove()
                    })
                document
                    .querySelectorAll('[data-radix-dialog-overlay]:not([data-state="open"])')
                    .forEach((el) => {
                        el.remove()
                    })

                // Force restore pointer events if dialog is closed
                const hasOpenDialog = document.querySelector(
                    '[data-radix-dialog-overlay][data-state="open"]'
                )
                if (!hasOpenDialog) {
                    document.body.style.pointerEvents = "auto"
                    document.documentElement.style.pointerEvents = "auto"
                    document.body.removeAttribute("data-scroll-locked")
                    document.documentElement.removeAttribute("data-scroll-locked")
                }
            }
        }, 100) // Check every 100ms

        return () => clearInterval(interval)
    }, [metricsDialogOpen])

    // Fix for Dialog overlay blocking page interactions
    useEffect(() => {
        const cleanup = () => {
            // Clean up any stuck overlays
            const overlays = document.querySelectorAll("[data-radix-dialog-overlay]")
            overlays.forEach((overlay: Element) => {
                const state = overlay.getAttribute("data-state")
                if (state === "closed" || !state) {
                    ;(overlay as HTMLElement).style.display = "none"
                    ;(overlay as HTMLElement).style.pointerEvents = "none"
                    overlay.remove()
                }
            })

            // Remove any stuck scroll locks
            document.body.removeAttribute("data-scroll-locked")
            document.documentElement.removeAttribute("data-scroll-locked")
            document.body.removeAttribute("data-radix-scroll-lock")
            document.documentElement.removeAttribute("data-radix-scroll-lock")

            // Force pointer events to be restored
            document.body.style.pointerEvents = ""
            document.documentElement.style.pointerEvents = ""
        }

        if (!metricsDialogOpen) {
            // Use setTimeout to ensure it runs after Radix UI cleanup
            const timeoutId = setTimeout(cleanup, 150)
            return () => clearTimeout(timeoutId)
        }
    }, [metricsDialogOpen])

    // Restore filter state from location state if available
    const locationState = (location.state as any)?.returnState

    // Get values from URL params or defaults
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "pending" | "draft">(
        locationState?.statusFilter || searchParams.get("status") || "all"
    )
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
        (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
    )
    const [dateRange, setDateRange] = useState(searchParams.get("dateRange") || "all")

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

    const deleteBlog = useDeleteBlogPost()
    const publishBlog = usePublishBlogPost()
    const unpublishBlog = useUnpublishBlogPost()

    // Convert status filter to backend format
    const getStatusFilter = (): "PENDING" | "APPROVED" | "REJECTED" | undefined => {
        if (statusFilter === "pending") return "PENDING"
        if (statusFilter === "published") return undefined // Will use published filter instead
        if (statusFilter === "draft") return undefined // Will use published filter instead
        return undefined // "all" - no status filter
    }

    // Calculate date range filter (client-side for now, could be backend)
    const getDateFilteredPosts = (posts: BlogPost[] | undefined): BlogPost[] => {
        if (!posts || dateRange === "all") return posts || []

        const now = new Date()
        return posts.filter((post) => {
            const postDate = new Date(post.createdAt)
            const diffTime = now.getTime() - postDate.getTime()
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

            if (dateRange === "today" && diffDays !== 0) return false
            if (dateRange === "week" && diffDays > 7) return false
            if (dateRange === "month" && diffDays > 30) return false
            if (dateRange === "3months" && diffDays > 90) return false
            if (dateRange === "year" && diffDays > 365) return false
            return true
        })
    }

    // Build query params for backend
    const queryParams: any = {
        authorId: user?.id,
        page,
        limit,
        sortBy: sortBy as any,
        sortOrder: sortOrder
    }

    if (searchQuery) {
        queryParams.search = searchQuery
    }

    // Status filter
    const statusFilterValue = getStatusFilter()
    if (statusFilterValue) {
        queryParams.status = statusFilterValue
    }

    // Published filter
    if (statusFilter === "published") {
        queryParams.published = true
    } else if (statusFilter === "draft") {
        queryParams.published = false
    }
    // "all" and "pending" don't filter by published

    // Fetch posts from backend with filters and pagination
    const allPosts = useGetBlogPosts(queryParams)

    // Apply date range filter client-side (since backend doesn't support it yet)
    // Note: This will affect pagination, but for now we'll keep it client-side
    const filteredPosts = getDateFilteredPosts(allPosts.data?.data) || []

    // Calculate pagination for filtered results
    const totalFiltered = filteredPosts.length
    const totalPages = Math.ceil(totalFiltered / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    const data = allPosts.data
        ? {
              ...allPosts.data,
              data: paginatedPosts,
              total: totalFiltered,
              totalPages
          }
        : undefined

    const isLoading = allPosts.isLoading
    const error = allPosts.error

    const handleDeleteClick = (postId: string) => {
        setPostToDelete(postId)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return

        try {
            await deleteBlog.mutateAsync(postToDelete)
            setDeleteDialogOpen(false)
            setPostToDelete(null)
            toast.success("Blog post deleted successfully")
        } catch (error) {
            console.error("Failed to delete blog post:", error)
            toast.error("Failed to delete blog post. Please try again.")
        }
    }

    const handlePublish = async (postId: string) => {
        try {
            await publishBlog.mutateAsync(postId)
        } catch (error) {
            console.error("Failed to publish blog post:", error)
            toast.error("Failed to publish blog post. Please try again.")
        }
    }

    const handleUnpublish = async (postId: string) => {
        try {
            await unpublishBlog.mutateAsync(postId)
        } catch (error) {
            console.error("Failed to unpublish blog post:", error)
            toast.error("Failed to unpublish blog post. Please try again.")
        }
    }

    const handleShare = async (postId: string) => {
        try {
            await axiosAuth.post(`blog/${postId}/share`, {})
            const url = `${window.location.origin}/blog/${
                data?.data.find((p) => p.id === postId)?.slug
            }`
            navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            console.error("Failed to share blog post:", error)
            toast.error("Failed to share blog post. Please try again.")
        }
    }

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleLimitChange = (newLimit: string) => {
        updateParams({ limit: Number.parseInt(newLimit, 10), page: 1 })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleSearchChange = (query: string) => {
        setSearchQuery(query)
        updateParams({ search: query || null, page: 1 })
    }

    const handleStatusChange = (value: "all" | "published" | "pending" | "draft") => {
        setStatusFilter(value)
        updateParams({ status: value !== "all" ? value : null, page: 1 })
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        updateParams({ sortBy: value, page: 1 })
    }

    const handleSortOrderChange = (value: string) => {
        const order = value as "asc" | "desc"
        setSortOrder(order)
        updateParams({ sortOrder: order, page: 1 })
    }

    const handleDateRangeChange = (value: string) => {
        setDateRange(value)
        updateParams({ dateRange: value !== "all" ? value : null, page: 1 })
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 font-bold text-2xl text-gray-900">Please Login</h2>
                    <p className="mb-4 text-gray-600">
                        You need to be logged in to view your blogs.
                    </p>
                    <Link to="/login">
                        <Button>Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 py-12 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <BookOpen className="h-8 w-8" />
                                <h1 className="font-bold text-4xl">My Blog Posts</h1>
                            </div>
                            <p className="text-red-100">Manage and track your blog posts</p>
                        </div>
                        <CreateBlogModal />
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-8">
                            <MyBlogsFilters
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                statusFilter={statusFilter}
                                onStatusChange={handleStatusChange}
                                sortBy={sortBy}
                                onSortChange={handleSortChange}
                                sortOrder={sortOrder}
                                onSortOrderChange={handleSortOrderChange}
                                dateRange={dateRange}
                                onDateRangeChange={handleDateRangeChange}
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
                                <p className="mb-4 text-gray-600">
                                    Start writing your first blog post!
                                </p>
                                <CreateBlogModal />
                            </div>
                        ) : (
                            <>
                                {/* Results Count and Page Size Selector */}
                                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <p className="text-gray-600">
                                        Showing{" "}
                                        <span className="font-semibold text-gray-900">
                                            {data.data.length > 0 ? (page - 1) * limit + 1 : 0}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min(page * limit, data.total)}
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
                                    {data.data.map((post) => (
                                        <div key={post.id} className="group relative">
                                            <BlogCard
                                                blogPost={post}
                                                returnTo="/blog/my-blogs"
                                                returnState={{ statusFilter }}
                                            />

                                            {/* Status Badge - Overlay */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <Badge
                                                    variant={
                                                        post.published
                                                            ? "default"
                                                            : post.status === "PENDING"
                                                              ? "secondary"
                                                              : post.status === "APPROVED"
                                                                ? "default"
                                                                : post.status === "REJECTED"
                                                                  ? "destructive"
                                                                  : "outline"
                                                    }
                                                    className={
                                                        post.published
                                                            ? "bg-green-500 text-white"
                                                            : post.status === "PENDING"
                                                              ? "bg-yellow-500 text-white"
                                                              : post.status === "APPROVED"
                                                                ? "bg-blue-500 text-white"
                                                                : post.status === "REJECTED"
                                                                  ? "bg-red-500 text-white"
                                                                  : "bg-gray-500 text-white"
                                                    }
                                                >
                                                    {post.published
                                                        ? "Published"
                                                        : post.status === "PENDING"
                                                          ? "Pending"
                                                          : post.status === "APPROVED"
                                                            ? "Approved"
                                                            : post.status === "REJECTED"
                                                              ? "Rejected"
                                                              : "Draft"}
                                                </Badge>
                                            </div>

                                            {/* Actions Menu - Appears on hover */}
                                            <div className="absolute right-4 bottom-4 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-white/90 backdrop-blur-sm"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="z-50 w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                navigate(`/blog/${post.slug}`, {
                                                                    state: {
                                                                        returnTo: "/blog/my-blogs",
                                                                        returnState: {
                                                                            statusFilter
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                navigate(
                                                                    `/blog/${post.slug}/edit`,
                                                                    {
                                                                        state: {
                                                                            returnTo:
                                                                                "/blog/my-blogs",
                                                                            returnState: {
                                                                                statusFilter,
                                                                                searchQuery,
                                                                                sortBy,
                                                                                sortOrder,
                                                                                dateRange
                                                                            }
                                                                        }
                                                                    }
                                                                )
                                                            }}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleShare(post.id)}
                                                        >
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            Share
                                                        </DropdownMenuItem>
                                                        {!post.published &&
                                                            post.status === "APPROVED" && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handlePublish(post.id)
                                                                    }
                                                                    disabled={publishBlog.isPending}
                                                                    className="text-green-700"
                                                                >
                                                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                                                    Publish
                                                                </DropdownMenuItem>
                                                            )}
                                                        {!post.published &&
                                                            post.status === "PENDING" && (
                                                                <DropdownMenuItem
                                                                    disabled
                                                                    className="cursor-not-allowed text-gray-400"
                                                                >
                                                                    <Clock className="mr-2 h-4 w-4" />
                                                                    Awaiting Approval
                                                                </DropdownMenuItem>
                                                            )}
                                                        {!post.published &&
                                                            post.status === "REJECTED" && (
                                                                <DropdownMenuItem
                                                                    disabled
                                                                    className="cursor-not-allowed text-red-400"
                                                                >
                                                                    <ThumbsDown className="mr-2 h-4 w-4" />
                                                                    Rejected - Cannot Publish
                                                                </DropdownMenuItem>
                                                            )}
                                                        {post.published && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUnpublish(post.id)
                                                                }
                                                                disabled={unpublishBlog.isPending}
                                                                className="text-yellow-700"
                                                            >
                                                                Unpublish
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault()
                                                                setSelectedPost(post.id)
                                                                // Small delay to ensure dropdown closes first
                                                                setTimeout(() => {
                                                                    setMetricsDialogOpen(true)
                                                                }, 100)
                                                            }}
                                                        >
                                                            <BarChart3 className="mr-2 h-4 w-4" />
                                                            View Metrics
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteClick(post.id)
                                                            }
                                                            disabled={deleteBlog.isPending}
                                                            className="text-red-700"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
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

            {/* Metrics Dialog */}
            <Dialog
                open={metricsDialogOpen}
                onOpenChange={(open) => {
                    setMetricsDialogOpen(open)
                    if (!open) {
                        setSelectedPost(null)
                        // AGGRESSIVE cleanup - force remove stuck overlays
                        setTimeout(() => {
                            // Remove all closed overlays
                            document
                                .querySelectorAll(
                                    '[data-radix-dialog-overlay][data-state="closed"]'
                                )
                                .forEach((el) => el.remove())
                            document
                                .querySelectorAll(
                                    '[data-radix-dialog-overlay]:not([data-state="open"])'
                                )
                                .forEach((el) => el.remove())
                            // Force restore pointer events
                            document.body.style.pointerEvents = "auto"
                            document.documentElement.style.pointerEvents = "auto"
                            // Remove scroll locks
                            document.body.removeAttribute("data-scroll-locked")
                            document.documentElement.removeAttribute("data-scroll-locked")
                            document.body.removeAttribute("data-radix-scroll-lock")
                            document.documentElement.removeAttribute("data-radix-scroll-lock")
                        }, 50)
                    }
                }}
            >
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Blog Post Metrics</DialogTitle>
                        <DialogDescription>
                            {selectedPost && data?.data.find((p) => p.id === selectedPost)?.title}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPost &&
                        (() => {
                            const post = data?.data.find((p) => p.id === selectedPost)
                            if (!post) return null
                            return (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Eye className="h-5 w-5 text-gray-600" />
                                                <span className="text-gray-600 text-sm">Views</span>
                                            </div>
                                            <p className="font-bold text-2xl text-gray-900">
                                                {post.views.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <ThumbsUp className="h-5 w-5 text-green-600" />
                                                <span className="text-gray-600 text-sm">Likes</span>
                                            </div>
                                            <p className="font-bold text-2xl text-gray-900">
                                                {post.likes}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <ThumbsDown className="h-5 w-5 text-red-600" />
                                                <span className="text-gray-600 text-sm">
                                                    Dislikes
                                                </span>
                                            </div>
                                            <p className="font-bold text-2xl text-gray-900">
                                                {post.dislikes}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Share2 className="h-5 w-5 text-blue-600" />
                                                <span className="text-gray-600 text-sm">
                                                    Shares
                                                </span>
                                            </div>
                                            <p className="font-bold text-2xl text-gray-900">
                                                {post.shares}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-gray-200 border-t pt-4">
                                        <div className="mb-1 flex items-center gap-2 text-gray-600 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <span>Created: {formatDate(post.createdAt)}</span>
                                        </div>
                                        {post.publishedAt && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Published: {formatDate(post.publishedAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })()}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this blog post? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPostToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteBlog.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleteBlog.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
