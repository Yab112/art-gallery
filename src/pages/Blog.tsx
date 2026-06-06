import { NewsBlogCard } from "@/components/blog/news-blog-card";
import { NewsBlogSkeleton } from "@/components/blog/news-blog-skeleton";
import { BlogFilters } from "@/components/blog/blog-filters";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGetBlogAuthors, useGetBlogPostsInfinite } from "@/services/blog";
import { BookOpen, Plus, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch all authors for filtering
  const { data: authorsData } = useGetBlogAuthors();
  const authors = authorsData || [];

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
  const limit = Number.parseInt(searchParams.get("limit") || "30", 10);
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const authorId = searchParams.get("authorId") || "";
  const isAdminView = searchParams.get("adminView") === "true";
  const isAdmin = (user as any)?.role?.toLowerCase() === "admin";

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

  // Fetch blog posts using Infinite Query
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useGetBlogPostsInfinite({
    limit,
    published: isAdminView ? undefined : true,
    status: isAdminView ? undefined : "APPROVED",
    search: searchQuery || undefined,
    authorId: authorId || undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as "asc" | "desc",
  });

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages of data
  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  // Identify featured posts using attribute-driven logic - NO FALLBACKS
  const heroPost = allPosts.find((p) => p.layout === "HERO" || p.isBreaking);

  const compactPosts = allPosts
    .filter((p) => p.layout === "COMPACT" && p.id !== heroPost?.id)
    .slice(0, 3);

  const linkOnlyPosts = allPosts
    .filter(
      (p) =>
        p.layout === "LINK_ONLY" &&
        p.id !== heroPost?.id &&
        !compactPosts.find((cp) => cp.id === p.id),
    )
    .slice(0, 6);

  const standardHighlights = allPosts
    .filter(
      (p) =>
        (p.category?.name?.toLowerCase().includes("market") ||
          p.topic?.name?.toLowerCase().includes("market")) &&
        p.id !== heroPost?.id &&
        !compactPosts.find((cp) => cp.id === p.id) &&
        !linkOnlyPosts.find((lp) => lp.id === p.id),
    )
    .slice(0, 4);

  const analysisPosts = allPosts
    .filter(
      (p) =>
        (p.badge?.toLowerCase() === "analysis" ||
          p.badge?.toLowerCase() === "opinion") &&
        p.id !== heroPost?.id &&
        !compactPosts.find((cp) => cp.id === p.id) &&
        !linkOnlyPosts.find((lp) => lp.id === p.id) &&
        !standardHighlights.find((sh) => sh.id === p.id),
    )
    .slice(0, 4);

  const overlayPost = allPosts.find(
    (p) =>
      (p.layout === "OVERLAY" || !!p.featuredArtistId) &&
      p.id !== heroPost?.id &&
      !compactPosts.find((cp) => cp.id === p.id) &&
      !linkOnlyPosts.find((lp) => lp.id === p.id) &&
      !standardHighlights.find((sh) => sh.id === p.id) &&
      !analysisPosts.find((ap) => ap.id === p.id),
  );

  const focusStandardPosts = allPosts
    .filter(
      (p) =>
        p.layout === "STANDARD" &&
        p.id !== heroPost?.id &&
        !compactPosts.find((cp) => cp.id === p.id) &&
        !linkOnlyPosts.find((lp) => lp.id === p.id) &&
        !standardHighlights.find((sh) => sh.id === p.id) &&
        !analysisPosts.find((ap) => ap.id === p.id) &&
        p.id !== overlayPost?.id,
    )
    .slice(0, 2);

  const sidebarPosts = allPosts
    .filter(
      (p) =>
        p.layout === "SIDEBAR" &&
        p.id !== heroPost?.id &&
        !compactPosts.find((cp) => cp.id === p.id) &&
        !linkOnlyPosts.find((lp) => lp.id === p.id) &&
        !standardHighlights.find((sh) => sh.id === p.id) &&
        !analysisPosts.find((ap) => ap.id === p.id) &&
        p.id !== overlayPost?.id &&
        !focusStandardPosts.find((fs) => fs.id === p.id),
    )
    .slice(0, 4);

  const featuredIds = new Set(
    [
      heroPost?.id,
      ...compactPosts.map((p) => p.id),
      ...linkOnlyPosts.map((p) => p.id),
      ...standardHighlights.map((p) => p.id),
      ...analysisPosts.map((p) => p.id),
      overlayPost?.id,
      ...focusStandardPosts.map((p) => p.id),
      ...sidebarPosts.map((p) => p.id),
    ].filter(Boolean),
  );

  const spotlightVideo =
    allPosts.find((p) => p.mediaType === "VIDEO" && !featuredIds.has(p.id)) ||
    allPosts.find((p) => p.mediaType === "VIDEO");

  if (spotlightVideo) {
    featuredIds.add(spotlightVideo.id);
  }

  const otherVideos = allPosts.filter(
    (p) => p.mediaType === "VIDEO" && p.id !== spotlightVideo?.id,
  );

  // Remaining posts for the main feed
  const feedPosts =
    searchQuery || isAdminView
      ? allPosts
      : allPosts.filter((post) => !featuredIds.has(post.id));

  const handleSearchChange = (query: string) => {
    updateParams({ search: query || null });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sortBy: value });
  };

  const handleSortOrderChange = (value: string) => {
    updateParams({ sortOrder: value });
  };

  const handleAuthorChange = (value: string) => {
    updateParams({ authorId: value || null });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* CNN Style Breaking News Ticker */}
      <div className="border-gray-200 border-b bg-black py-1">
        <div className="mx-auto max-w-[1600px] px-4 py-1">
          <div className="flex h-10 items-center">
            <div className="flex items-center gap-3 border-white/20 border-r pr-4">
              <span className="font-black text-[10px] text-white uppercase tracking-[0.2em]">
                Latest updates
              </span>
            </div>
            <div className="flex flex-1 items-center overflow-hidden px-4">
              {isLoading ? (
                <div className="h-3 w-48 animate-pulse rounded bg-gray-800" />
              ) : allPosts.length > 0 ? (
                <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
                  {allPosts.slice(0, 3).map((post, idx) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group flex items-center gap-2 transition-colors hover:text-red-500"
                    >
                      {idx > 0 && (
                        <span className="h-1 w-1 rounded-full bg-gray-600" />
                      )}
                      <span className="font-bold text-gray-400 text-xs transition-colors group-hover:text-white">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="hidden items-center gap-6 border-white/20 border-l pl-4 md:flex">
              <span className="font-black text-[9px] text-gray-500 uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-gray-100 pb-12 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 font-black text-4xl text-gray-900 uppercase tracking-tighter md:text-6xl">
              The Art Journal
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {user && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-14 rounded-none bg-black px-10 font-black text-white text-sm uppercase tracking-[0.2em] transition-all hover:bg-red-700 shadow-xl"
              >
                <Plus className="mr-3 h-5 w-5" />
                Write a Story
              </Button>
            )}
          </div>
        </div>

        {/* CNN Style Top Stories Section */}
        {isLoading ? (
          <section className="mb-24">
            <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-3 space-y-6">
                <NewsBlogSkeleton layout="COMPACT" />
                <NewsBlogSkeleton layout="COMPACT" />
                <NewsBlogSkeleton layout="COMPACT" />
              </div>
              <div className="lg:col-span-6">
                <NewsBlogSkeleton layout="HERO" />
              </div>
              <div className="lg:col-span-3 space-y-4">
                <NewsBlogSkeleton layout="LINK_ONLY" />
                <NewsBlogSkeleton layout="LINK_ONLY" />
                <NewsBlogSkeleton layout="LINK_ONLY" />
                <NewsBlogSkeleton layout="LINK_ONLY" />
              </div>
            </div>
          </section>
        ) : (heroPost || compactPosts.length > 0 || linkOnlyPosts.length > 0) &&
          !searchQuery ? (
          <section className="mb-24">
            <div className="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Left Column - Featured Stories List */}
              <div className="lg:col-span-3">
                <div className="space-y-0 divide-y divide-gray-100 border-gray-100 border-t lg:border-t-0">
                  {compactPosts.map((post) => (
                    <NewsBlogCard
                      key={post.id}
                      blogPost={post}
                      layout="COMPACT"
                    />
                  ))}
                </div>
              </div>

              {/* Middle Column - Main Hero Story */}
              <div className="lg:col-span-6">
                {heroPost && <NewsBlogCard blogPost={heroPost} layout="HERO" />}
              </div>

              {/* Right Column - Secondary Sidebar */}
              <div className="lg:col-span-3">
                <div className="border-gray-100 border-l pl-8">
                  {linkOnlyPosts.length > 0 && (
                    <>
                      <h3 className="mb-6 border-red-700 border-l-4 pl-3 font-black text-gray-900 text-[11px] uppercase tracking-[0.2em]">
                        More from the field
                      </h3>
                      <div className="space-y-2">
                        {linkOnlyPosts.map((post) => (
                          <NewsBlogCard
                            key={post.id}
                            blogPost={post}
                            layout="LINK_ONLY"
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <Link
                    to="/blog"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="mt-10 flex items-center gap-2 font-black text-red-700 text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-black"
                  >
                    See full coverage <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sub-hero Horizontal Strip */}
            {standardHighlights.length > 0 && (
              <div className="mt-16 border-gray-100 border-t pt-16">
                <h3 className="mb-10 border-black border-l-4 pl-4 font-black text-gray-900 text-sm uppercase tracking-[0.2em]">
                  Art Market Highlights
                </h3>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                  {standardHighlights.map((post) => (
                    <NewsBlogCard
                      key={post.id}
                      blogPost={post}
                      layout="STANDARD"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* More Stories Section (Image 2 Style) */}
        {!isLoading &&
          (analysisPosts.length > 0 ||
            overlayPost ||
            focusStandardPosts.length > 0 ||
            sidebarPosts.length > 0) &&
          !searchQuery && (
            <section className="mb-24 border-gray-100 border-t pt-16">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Left: More Top Stories Text List */}
                <div className="lg:col-span-3">
                  {analysisPosts.length > 0 && (
                    <>
                      <h3 className="mb-8 border-black border-l-4 pl-4 font-black text-gray-900 text-xs uppercase tracking-[0.2em]">
                        Analysis & Opinion
                      </h3>
                      <div className="divide-y divide-gray-100 border-gray-100 border-t">
                        {analysisPosts.map((post) => (
                          <NewsBlogCard
                            key={post.id}
                            blogPost={post}
                            layout="TEXT_ONLY"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Middle: Travel/Featured Section Style */}
                <div className="lg:col-span-6">
                  {(overlayPost || focusStandardPosts.length > 0) && (
                    <>
                      <h3 className="mb-8 border-black border-l-4 pl-4 font-black text-gray-900 text-xs uppercase tracking-[0.2em]">
                        Artist in Focus
                      </h3>
                      <div className="flex flex-col gap-10">
                        {overlayPost && (
                          <NewsBlogCard
                            blogPost={overlayPost}
                            layout="OVERLAY"
                          />
                        )}
                        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                          {focusStandardPosts.map((post) => (
                            <NewsBlogCard
                              key={post.id}
                              blogPost={post}
                              layout="STANDARD"
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Sidebar Section Style */}
                <div className="lg:col-span-3">
                  {sidebarPosts.length > 0 && (
                    <div className="rounded-sm bg-gray-50 p-8">
                      <h3 className="mb-8 border-red-700 border-l-4 pl-4 font-black text-gray-900 text-xs uppercase tracking-[0.2em]">
                        Art World Events
                      </h3>
                      <div className="space-y-8">
                        {sidebarPosts.map((post) => (
                          <NewsBlogCard
                            key={post.id}
                            blogPost={post}
                            layout="SIDEBAR"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        {/* Multimedia Spotlight - Video Section Style */}
        {!isLoading && spotlightVideo && !searchQuery && (
          <section className="mb-24 border-gray-100 border-y py-20">
            <div className="mb-12 flex items-center justify-between">
              <h3 className="border-red-700 border-l-4 pl-4 font-black text-2xl text-gray-900 uppercase tracking-[0.2em]">
                Watch: Art in Motion
              </h3>
              <Link
                to="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="font-black text-red-700 text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-black"
              >
                View all videos
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <NewsBlogCard blogPost={spotlightVideo} layout="HERO" />
              </div>
              <div className="lg:col-span-4">
                <div className="space-y-0 divide-y divide-gray-100 border-gray-100 border-t">
                  {otherVideos.slice(0, 4).map((post) => (
                    <NewsBlogCard
                      key={post.id}
                      blogPost={post}
                      layout="COMPACT"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Feed Section */}
        <div className="mb-12 border-gray-200 border-y py-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-black text-gray-900 text-2xl uppercase tracking-widest">
              The Latest Collection
            </h2>
          </div>

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

        <main>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <NewsBlogSkeleton key={i} layout="STANDARD" />
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="font-bold text-red-700 uppercase tracking-widest">
                Failed to load blog posts. Please try again.
              </p>
            </div>
          ) : allPosts.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-6 h-16 w-16 text-gray-200" />
              <h3 className="mb-2 font-black text-2xl text-gray-900 uppercase">
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
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                {feedPosts.map((post) => (
                  <NewsBlogCard
                    key={post.id}
                    blogPost={post}
                    layout="STANDARD"
                  />
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              <div
                ref={loadMoreRef}
                className="mt-20 flex flex-col items-center justify-center py-12 border-t border-gray-100"
              >
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-red-700" />
                    <span className="font-black text-gray-900 text-xs uppercase tracking-[0.3em]">
                      Curating more stories...
                    </span>
                  </div>
                ) : hasNextPage ? (
                  <button
                    onClick={() => fetchNextPage()}
                    className="font-black text-gray-400 text-[10px] uppercase tracking-[0.5em] transition-colors hover:text-red-700"
                  >
                    Scroll to discover
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-1 w-12 bg-gray-100 rounded-full mb-4" />
                    <span className="font-black text-gray-300 text-[10px] uppercase tracking-[0.5em]">
                      End of Collection
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      <CreateBlogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
