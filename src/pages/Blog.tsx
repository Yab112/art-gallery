import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { BlogFilters } from "@/components/blog/blog-filters";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGetBlogPosts } from "@/services/blog";
import { BookOpen, Plus, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fix for Radix UI Select dropdown page shift issue
  useEffect(() => {
    const styleId = "prevent-select-margin-blog-page";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
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
      `;
      document.head.appendChild(styleElement);
    }

    const interval = setInterval(() => {
      const body = document.body;
      const html = document.documentElement;
      body.style.setProperty("margin-right", "0", "important");
      body.style.setProperty("padding-right", "0", "important");
      html.style.setProperty("margin-right", "0", "important");
      html.style.setProperty("padding-right", "0", "important");
    }, 16);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Get filter values from URL
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "12", 10);
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const authorId = searchParams.get("authorId") || "";

  // Update URL params
  const updateParams = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Fetch blog posts
  const { data, isLoading, error } = useGetBlogPosts({
    page,
    limit,
    published: true,
    search: searchQuery || undefined,
    authorId: authorId || undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as "asc" | "desc",
  });

  // Extract unique authors from blog posts
  const authors = Array.from(
    new Map(
      data?.data
        .filter((post) => post.author)
        .map((post) => [post.author!.id, post.author!]),
    ).values(),
  );

  const handleSearchChange = (query: string) => {
    updateParams({ search: query || null, page: 1 });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sortBy: value, page: 1 });
  };

  const handleSortOrderChange = (value: string) => {
    updateParams({ sortOrder: value, page: 1 });
  };

  const handleAuthorChange = (value: string) => {
    updateParams({ authorId: value || null, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit: string) => {
    updateParams({ limit: Number.parseInt(newLimit, 10), page: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Restored Original Red Banner */}
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

      {/* Breaking/Trending Ticker Bar */}
      <div className="border-gray-100 border-b bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center">
            <div className="flex items-center gap-2 whitespace-nowrap border-gray-200 border-r pr-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
              </span>
              <span className="font-bold text-gray-900 text-xs uppercase tracking-widest">
                Trending Now
              </span>
            </div>
            <div className="flex flex-1 items-center overflow-hidden px-6">
              {isLoading ? (
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              ) : data?.data && data.data.length > 0 ? (
                <Link
                  to={`/blog/${data.data[0].slug}`}
                  className="truncate text-gray-600 text-sm transition-colors hover:text-red-700"
                >
                  <span className="mr-2 font-semibold text-red-700">
                    Latest:
                  </span>
                  {data.data[0].title}
                </Link>
              ) : (
                <span className="text-gray-400 text-sm italic">
                  Stay tuned for new stories...
                </span>
              )}
            </div>
            <div className="hidden items-center gap-4 border-gray-200 border-l pl-6 md:flex">
              <span className="text-gray-400 text-xs uppercase tracking-tighter">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Simplified Header with Write Button */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="font-bold text-3xl text-gray-900 tracking-tight">
            Latest Stories
          </h2>
          {user && (
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-11 rounded-sm bg-red-700 px-6 font-medium text-white hover:bg-red-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Write a Story
              </Button>
              <CreateBlogModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="space-y-16">
          {/* Horizontal Filters */}
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

          {/* Main Content List */}
          <main>
            {isLoading ? (
              <div className="space-y-12">
                {[...Array(6)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-700 font-medium">
                  Failed to load blog posts. Please try again.
                </p>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="py-20 text-center">
                <BookOpen className="mx-auto mb-6 h-16 w-16 text-gray-200" />
                <h3 className="mb-2 font-bold text-2xl text-gray-900">
                  No stories found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search or filters."
                    : "Check back soon for new articles!"}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {data.data.map((post) => (
                    <BlogCard key={post.id} blogPost={post} />
                  ))}
                </div>

                {/* Pagination - Always show if there are posts */}
                {data && data.total > 0 && (
                  <div className="mt-16 flex flex-col items-center justify-center gap-4 border-t border-gray-100 pt-12">
                    {data.totalPages > 1 ? (
                      <>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="min-w-[80px] rounded-sm"
                          >
                            Previous
                          </Button>

                          <div className="flex items-center gap-1">
                            {/* Show first page if not in initial range */}
                            {data.totalPages > 5 && page > 3 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePageChange(1)}
                                  className="min-w-[40px] rounded-sm"
                                >
                                  1
                                </Button>
                                {page > 4 && (
                                  <span className="px-2 text-gray-500">
                                    ...
                                  </span>
                                )}
                              </>
                            )}

                            {/* Show page numbers */}
                            {Array.from(
                              { length: Math.min(5, data.totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (data.totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (page <= 3) {
                                  pageNum = i + 1;
                                } else if (page >= data.totalPages - 2) {
                                  pageNum = data.totalPages - 4 + i;
                                } else {
                                  pageNum = page - 2 + i;
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      page === pageNum ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className={
                                      page === pageNum
                                        ? "min-w-[40px] rounded-sm bg-red-700 hover:bg-red-800"
                                        : "min-w-[40px] rounded-sm"
                                    }
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              },
                            )}

                            {/* Show last page if not in final range */}
                            {data.totalPages > 5 &&
                              page < data.totalPages - 2 && (
                                <>
                                  {page < data.totalPages - 3 && (
                                    <span className="px-2 text-gray-500">
                                      ...
                                    </span>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handlePageChange(data.totalPages)
                                    }
                                    className="min-w-[40px] rounded-sm"
                                  >
                                    {data.totalPages}
                                  </Button>
                                </>
                              )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === data.totalPages}
                            className="min-w-[80px] rounded-sm"
                          >
                            Next
                          </Button>
                        </div>

                        {/* Page info */}
                        <p className="text-gray-500 text-sm">
                          Page {page} of {data.totalPages} • {data.total} total
                          posts
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Showing all {data.total} post
                        {data.total !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
