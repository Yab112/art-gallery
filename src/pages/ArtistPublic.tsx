import { AboutSection } from "@/components/artist/about-section";
import { ArtistProfileEnhanced } from "@/components/artist/artist-profile-enhanced";
import { ArtworkGrid } from "@/components/artist/artwork-grid";
import { FilterControls } from "@/components/artist/filter-controls";
import { ImageModal } from "@/components/artist/image-modal";
import { NavigationTabs } from "@/components/artist/navigation-tabs";
import { SimilarArtists } from "@/components/artist/similar-artists";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useUser } from "@/queries/userQueries";
import { useArtworks } from "@/queries/artworkQueries";
import { ArtistDetailSkeleton } from "@/components/artist/artist-detail-skeleton";
import { useGetBlogPosts } from "@/services/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { useGetUserCollections } from "@/services/collections/useGetUserCollections";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, FolderOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get active tab from URL query params, default to "artworks"
  const activeTab = searchParams.get("tab") || "artworks";

  // Get filter values from URL query params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const blogPage = parseInt(searchParams.get("blogPage") || "1", 10);
  const collectionPage = parseInt(searchParams.get("collectionPage") || "1", 10);
  const sortBy = searchParams.get("sort") || "recommended";
  const priceRange = searchParams.get("priceRange") || "";
  const medium = searchParams.get("medium") || "";
  const status = searchParams.get("status") || "APPROVED";

  // Update URL query params
  const updateSearchParams = (
    updates: Record<string, string | number | null>
  ) => {
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

  const setActiveTab = (tab: string) => {
    updateSearchParams({ tab, page: 1 });
  };

  // Fetch artist data
  const { data: userResponse, isLoading: isLoadingUser } = useUser(id || "");
  const user = userResponse?.profile;

  // Build query params for artworks
  const buildArtworkParams = () => {
    if (!id) {
      // Return null to disable query until user ID is available
      return null;
    }

    const params: any = {
      page,
      limit: 20,
      status,
    };

    // Filter by userId (more reliable than artist name)
    params.userId = id;

    // Map sort filter to backend params
    switch (sortBy) {
      case "price-low":
        params.sortBy = "desiredPrice";
        params.orderBy = "asc";
        break;
      case "price-high":
        params.sortBy = "desiredPrice";
        params.orderBy = "desc";
        break;
      case "newest":
        params.sortBy = "createdAt";
        params.orderBy = "desc";
        break;
      case "oldest":
        params.sortBy = "createdAt";
        params.orderBy = "asc";
        break;
      case "recommended":
      default:
        params.sortBy = "createdAt";
        params.orderBy = "desc";
        break;
    }

    // Map price range filter
    if (priceRange) {
      switch (priceRange) {
        case "under-1k":
          params.maxPrice = 1000;
          break;
        case "1k-10k":
          params.minPrice = 1000;
          params.maxPrice = 10000;
          break;
        case "10k-50k":
          params.minPrice = 10000;
          params.maxPrice = 50000;
          break;
        case "over-50k":
          params.minPrice = 50000;
          break;
      }
    }

    // Map medium filter to technique
    if (medium) {
      params.technique = medium;
    }

    return params;
  };

  // Fetch artist's artworks - only when user is loaded
  const artworkParams = buildArtworkParams();
  const { data: artworksResponse, isLoading: isLoadingArtworks } = useArtworks(
    artworkParams || undefined
  );
  const artworks = artworksResponse?.artworks || [];
  const artworksTotal = artworksResponse?.total || 0;
  const artworksPages = artworksResponse?.pages || 1;

  // Fetch artist's blogs (only published and approved)
  const { data: blogsResponse, isLoading: isLoadingBlogs } = useGetBlogPosts({
    authorId: id,
    published: true,
    status: "APPROVED",
    page: blogPage,
    limit: 10,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const blogs = blogsResponse?.data || [];
  const blogsTotal = blogsResponse?.total || 0;
  const blogsPages = blogsResponse?.pages || 1;

  // Fetch artist's collections (only public)
  const { data: collectionsResponse, isLoading: isLoadingCollections } = useGetUserCollections(
    id || "",
    collectionPage,
    12,
    "public"
  );
  const collections = collectionsResponse?.collections || [];
  const collectionsTotal = collectionsResponse?.total || 0;
  const collectionsPages = collectionsResponse?.pages || 1;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  if (isLoadingUser) {
    return <ArtistDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Artist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <ArtistProfileEnhanced 
          user={user} 
          artworks={artworks}
          collectionsCount={collectionsTotal}
          blogsCount={blogsTotal}
        />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "artworks" && (
          <>
            <FilterControls
              sortBy={sortBy}
              onSortChange={(value: string) =>
                updateSearchParams({ sort: value, page: 1 })
              }
              priceRange={priceRange}
              onPriceRangeChange={(value: string) =>
                updateSearchParams({ priceRange: value || null, page: 1 })
              }
              medium={medium}
              onMediumChange={(value: string) =>
                updateSearchParams({ medium: value || null, page: 1 })
              }
            />
            <ArtworkGrid
              artworks={artworks}
              isLoading={isLoadingArtworks}
              onImageClick={setSelectedImage}
            />
            {/* Artworks Pagination */}
            {artworksPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: page - 1 })}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {artworksPages} ({artworksTotal} artworks)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: page + 1 })}
                  disabled={page >= artworksPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === "about" && <AboutSection user={user} />}

        {activeTab === "blog" && (
          <div className="mt-8">
            {isLoadingBlogs ? (
              <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="mt-12">
                <EmptyState
                  icon={BookOpen}
                  title="No Blog Posts"
                  description="This artist hasn't published any blog posts yet."
                />
              </div>
            ) : (
              <>
                <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {blogs.map((post) => (
                    <BlogCard key={post.id} blogPost={post} />
                  ))}
                </div>
                {/* Pagination */}
                {blogsPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ blogPage: blogPage - 1 })}
                      disabled={blogPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {blogPage} of {blogsPages} ({blogsTotal} posts)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ blogPage: blogPage + 1 })}
                      disabled={blogPage >= blogsPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="mt-8">
            {isLoadingCollections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="mt-12">
                <EmptyState
                  icon={FolderOpen}
                  title="No Collections"
                  description="This artist hasn't created any public collections yet."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collection/${collection.id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        {collection.coverImage ? (
                          <img
                            src={collection.coverImage}
                            alt={collection.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <FolderOpen className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{collection.artworkCount || 0} artworks</span>
                            <span className="capitalize">{collection.visibility}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Pagination */}
                {collectionsPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ collectionPage: collectionPage - 1 })}
                      disabled={collectionPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {collectionPage} of {collectionsPages} ({collectionsTotal} collections)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ collectionPage: collectionPage + 1 })}
                      disabled={collectionPage >= collectionsPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <SimilarArtists artistId={id || ""} />

        {selectedImage && (
          <ImageModal
            src={selectedImage || "/placeholder.svg"}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </div>
  );
}
