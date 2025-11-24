import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { BlogFilters } from "@/components/blog/blog-filters";
import { useGetBlogPosts } from "@/services/blog";
import { Loader2, BookOpen, Sparkles, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";

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
  const page = parseInt(searchParams.get("page") || "1", 10);
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
    limit: 12,
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
        .map((post) => [post.author!.id, post.author!])
    ).values()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-12 h-12" />
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Art & Inspiration Blog</h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto mb-6">
              Discover stories, insights, and inspiration from the world of art.
              Explore our curated collection of articles, artist features, and creative journeys.
            </p>
            {user && (
              <Link to="/blog/my-blogs">
                <Button variant="secondary" size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                  <User className="w-5 h-5 mr-2" />
                  My Blogs
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Create Blog Button - Top Right */}
        {user && (
          <div className="mb-6 flex justify-end">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-700 hover:bg-red-800"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Blog Post
            </Button>
            <CreateBlogModal 
              isOpen={isCreateModalOpen} 
              onClose={() => setIsCreateModalOpen(false)} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
          <main className="lg:col-span-3 max-w-4xl">
            {isLoading ? (
              <div className="space-y-0 mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">Failed to load blog posts. Please try again.</p>
              </div>
            ) : !data || data.data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search or filters."
                    : "Check back soon for new articles!"}
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{data.data.length}</span> of{" "}
                    <span className="font-semibold text-gray-900">{data.total}</span> posts
                  </p>
                </div>

                {/* Blog Posts List - Medium Style */}
                <div className="space-y-0 mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {data.data.map((post, index) => (
                    <BlogCard key={post.id} blogPost={post} />
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
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
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={page === pageNum ? "bg-red-700 hover:bg-red-800" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === data.totalPages}
                    >
                      Next
                    </Button>
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

