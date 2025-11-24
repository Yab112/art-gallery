import { useState, useEffect } from "react";
import { useGetBlogPosts } from "@/services/blog";
import { useAuth } from "@/hooks/use-auth";
import {
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from "@/services/blog";
import useAxiosAuth from "@/hooks/use-axios-auth";
import {
  Edit,
  Trash2,
  Share2,
  Eye,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  BarChart3,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { MyBlogsFilters } from "@/components/blog/my-blogs-filters";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { BlogPost } from "@/types/blog.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MyBlogsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosAuth = useAxiosAuth();
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  // AGGRESSIVE cleanup - continuously monitor and remove stuck overlays
  useEffect(() => {
    const interval = setInterval(() => {
      if (!metricsDialogOpen) {
        // Remove any closed overlays
        document
          .querySelectorAll('[data-radix-dialog-overlay][data-state="closed"]')
          .forEach((el) => {
            el.remove();
          });
        document
          .querySelectorAll(
            '[data-radix-dialog-overlay]:not([data-state="open"])'
          )
          .forEach((el) => {
            el.remove();
          });

        // Force restore pointer events if dialog is closed
        const hasOpenDialog = document.querySelector(
          '[data-radix-dialog-overlay][data-state="open"]'
        );
        if (!hasOpenDialog) {
          document.body.style.pointerEvents = "auto";
          document.documentElement.style.pointerEvents = "auto";
          document.body.removeAttribute("data-scroll-locked");
          document.documentElement.removeAttribute("data-scroll-locked");
        }
      }
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [metricsDialogOpen]);

  // Fix for Dialog overlay blocking page interactions
  useEffect(() => {
    const cleanup = () => {
      // Clean up any stuck overlays
      const overlays = document.querySelectorAll("[data-radix-dialog-overlay]");
      overlays.forEach((overlay: Element) => {
        const state = overlay.getAttribute("data-state");
        if (state === "closed" || !state) {
          (overlay as HTMLElement).style.display = "none";
          (overlay as HTMLElement).style.pointerEvents = "none";
          overlay.remove();
        }
      });

      // Remove any stuck scroll locks
      document.body.removeAttribute("data-scroll-locked");
      document.documentElement.removeAttribute("data-scroll-locked");
      document.body.removeAttribute("data-radix-scroll-lock");
      document.documentElement.removeAttribute("data-radix-scroll-lock");

      // Force pointer events to be restored
      document.body.style.pointerEvents = "";
      document.documentElement.style.pointerEvents = "";
    };

    if (!metricsDialogOpen) {
      // Use setTimeout to ensure it runs after Radix UI cleanup
      const timeoutId = setTimeout(cleanup, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [metricsDialogOpen]);

  // Restore filter state from location state if available
  const locationState = (location.state as any)?.returnState;
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "pending" | "draft"
  >(locationState?.statusFilter || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState("all");

  const deleteBlog = useDeleteBlogPost();
  const publishBlog = usePublishBlogPost();
  const unpublishBlog = useUnpublishBlogPost();

  // Convert status filter to backend format
  const getStatusFilter = ():
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | undefined => {
    if (statusFilter === "pending") return "PENDING";
    if (statusFilter === "published") return undefined; // Will use published filter instead
    if (statusFilter === "draft") return undefined; // Will use published filter instead
    return undefined; // "all" - no status filter
  };

  // Calculate date range filter (client-side for now, could be backend)
  const getDateFilteredPosts = (posts: BlogPost[] | undefined): BlogPost[] => {
    if (!posts || dateRange === "all") return posts || [];

    const now = new Date();
    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      const diffTime = now.getTime() - postDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (dateRange === "today" && diffDays !== 0) return false;
      if (dateRange === "week" && diffDays > 7) return false;
      if (dateRange === "month" && diffDays > 30) return false;
      if (dateRange === "3months" && diffDays > 90) return false;
      if (dateRange === "year" && diffDays > 365) return false;
      return true;
    });
  };

  // Build query params for backend
  const queryParams: any = {
    authorId: user?.id,
    limit: 100,
    sortBy: sortBy as any,
    sortOrder: sortOrder,
  };

  if (searchQuery) {
    queryParams.search = searchQuery;
  }

  // Status filter
  const statusFilterValue = getStatusFilter();
  if (statusFilterValue) {
    queryParams.status = statusFilterValue;
  }

  // Published filter
  if (statusFilter === "published") {
    queryParams.published = true;
  } else if (statusFilter === "draft") {
    queryParams.published = false;
  }
  // "all" and "pending" don't filter by published

  // Fetch posts from backend with filters
  const allPosts = useGetBlogPosts(queryParams);

  // Apply date range filter client-side (since backend doesn't support it yet)
  const filteredPosts = getDateFilteredPosts(allPosts.data?.data) || [];

  const data = allPosts.data
    ? {
        ...allPosts.data,
        data: filteredPosts,
        total: filteredPosts.length,
      }
    : undefined;

  const isLoading = allPosts.isLoading;
  const error = allPosts.error;

  const handleDelete = async (postId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    ) {
      try {
        await deleteBlog.mutateAsync(postId);
      } catch (error) {
        console.error("Failed to delete blog post:", error);
        toast.error("Failed to delete blog post. Please try again.");
      }
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      await publishBlog.mutateAsync(postId);
    } catch (error) {
      console.error("Failed to publish blog post:", error);
      toast.error("Failed to publish blog post. Please try again.");
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      await unpublishBlog.mutateAsync(postId);
    } catch (error) {
      console.error("Failed to unpublish blog post:", error);
      toast.error("Failed to unpublish blog post. Please try again.");
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await axiosAuth.post(`blog/${postId}/share`, {});
      const url = `${window.location.origin}/blog/${
        data?.data.find((p) => p.id === postId)?.slug
      }`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to share blog post:", error);
      toast.error("Failed to share blog post. Please try again.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your blogs.
          </p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8" />
                <h1 className="text-4xl font-bold">My Blog Posts</h1>
              </div>
              <p className="text-red-100">Manage and track your blog posts</p>
            </div>
            <CreateBlogModal />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <MyBlogsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={(value) =>
                  setSortOrder(value as "asc" | "desc")
                }
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 max-w-4xl">
            {isLoading ? (
              <div className="space-y-0 mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">
                  Failed to load blog posts. Please try again.
                </p>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blog posts found
                </h3>
                <p className="text-gray-600 mb-4">
                  Start writing your first blog post!
                </p>
                <CreateBlogModal />
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {data.data.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {data.total}
                    </span>{" "}
                    posts
                  </p>
                </div>

                {/* Blog Posts List - Medium Style */}
                <div className="space-y-0 mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {data.data.map((post) => (
                    <div key={post.id} className="relative group">
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
                              : "outline"
                          }
                          className={
                            post.published
                              ? "bg-green-500 text-white"
                              : post.status === "PENDING"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-500 text-white"
                          }
                        >
                          {post.published
                            ? "Published"
                            : post.status === "PENDING"
                            ? "Pending"
                            : "Draft"}
                        </Badge>
                      </div>

                      {/* Actions Menu - Appears on hover */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/90 backdrop-blur-sm"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 z-50"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/blog/${post.slug}`, {
                                  state: {
                                    returnTo: "/blog/my-blogs",
                                    returnState: { statusFilter },
                                  },
                                })
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigate(`/blog/${post.slug}/edit`, {
                                  state: {
                                    returnTo: "/blog/my-blogs",
                                    returnState: {
                                      statusFilter,
                                      searchQuery,
                                      sortBy,
                                      sortOrder,
                                      dateRange,
                                    },
                                  },
                                });
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!post.published && (
                              <DropdownMenuItem
                                onClick={() => handlePublish(post.id)}
                                disabled={publishBlog.isPending}
                                className="text-green-700"
                              >
                                Publish
                              </DropdownMenuItem>
                            )}
                            {post.published && (
                              <DropdownMenuItem
                                onClick={() => handleUnpublish(post.id)}
                                disabled={unpublishBlog.isPending}
                                className="text-yellow-700"
                              >
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleShare(post.id)}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setSelectedPost(post.id);
                                // Small delay to ensure dropdown closes first
                                setTimeout(() => {
                                  setMetricsDialogOpen(true);
                                }, 100);
                              }}
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Metrics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(post.id)}
                              disabled={deleteBlog.isPending}
                              className="text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Metrics Dialog */}
      <Dialog
        open={metricsDialogOpen}
        onOpenChange={(open) => {
          setMetricsDialogOpen(open);
          if (!open) {
            setSelectedPost(null);
            // AGGRESSIVE cleanup - force remove stuck overlays
            setTimeout(() => {
              // Remove all closed overlays
              document
                .querySelectorAll(
                  '[data-radix-dialog-overlay][data-state="closed"]'
                )
                .forEach((el) => el.remove());
              document
                .querySelectorAll(
                  '[data-radix-dialog-overlay]:not([data-state="open"])'
                )
                .forEach((el) => el.remove());
              // Force restore pointer events
              document.body.style.pointerEvents = "auto";
              document.documentElement.style.pointerEvents = "auto";
              // Remove scroll locks
              document.body.removeAttribute("data-scroll-locked");
              document.documentElement.removeAttribute("data-scroll-locked");
              document.body.removeAttribute("data-radix-scroll-lock");
              document.documentElement.removeAttribute(
                "data-radix-scroll-lock"
              );
            }, 50);
          }
        }}
      >
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Blog Post Metrics</DialogTitle>
            <DialogDescription>
              {selectedPost &&
                data?.data.find((p) => p.id === selectedPost)?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedPost &&
            (() => {
              const post = data?.data.find((p) => p.id === selectedPost);
              if (!post) return null;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">Views</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {post.views.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">Likes</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {post.likes}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsDown className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">Dislikes</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {post.dislikes}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Shares</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {post.shares}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {formatDate(post.createdAt)}</span>
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Published: {formatDate(post.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
