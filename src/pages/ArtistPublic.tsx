import { AboutSection } from "@/components/artist/about-section";
import { ArtistProfileEnhanced } from "@/components/artist/artist-profile-enhanced";
import { ArtworkGrid } from "@/components/artist/artwork-grid";
import { FilterControls } from "@/components/artist/filter-controls";
import { ImageModal } from "@/components/artist/image-modal";
import { NavigationTabs } from "@/components/artist/navigation-tabs";
import { SimilarArtists } from "@/components/artist/similar-artists";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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
import { BookOpen, FolderOpen, Loader2, MapPin, Globe, Calendar, Mail, Palette, Award } from "lucide-react";
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
  const collectionPage = parseInt(
    searchParams.get("collectionPage") || "1",
    10
  );
  const sortBy = searchParams.get("sort") || "recommended";
  const priceRange = searchParams.get("priceRange") || "";
  const medium = searchParams.get("medium") || "";
  const support = searchParams.get("support") || "";
  const origin = searchParams.get("origin") || "";
  const yearOfArtwork = searchParams.get("yearOfArtwork") || "";
  const categoryParam = searchParams.get("categories") || "";
  const selectedCategoryIds = categoryParam
    ? categoryParam.split(",").filter((id) => id.trim() !== "")
    : [];
  const status = searchParams.get("status") || "APPROVED";

  // Update URL query params
  const updateSearchParams = (
    updates: Record<string, string | number | string[] | null>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        // For arrays (like categoryIds), join with comma
        newParams.set(key, value.join(","));
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

  // Debug: Log artist data when it loads
  useEffect(() => {
    if (user && process.env.NODE_ENV === "development") {
      console.log("🎨 Artist Detail Page - Artist data loaded:", {
        id: user.id,
        name: user.name,
        email: user.email,
        talentTypes: user.talentTypes,
        artworkCount: user.artworkCount,
        profileViews: user.profileViews,
        heatScore: user.heatScore,
        fullUser: user,
      });
    }
  }, [user]);

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

    // Map medium filter to technique (backend DTO accepts technique and maps it to support)
    if (medium) {
      params.technique = medium;
    }

    // Add support filter (if different from medium) - backend accepts both technique and support
    if (support && support !== medium) {
      params.support = support;
    }

    // Add origin filter
    if (origin) {
      params.origin = origin;
    }

    // Add year of artwork filter
    if (yearOfArtwork) {
      params.yearOfArtwork = yearOfArtwork;
    }

    // Add category filter
    if (selectedCategoryIds.length > 0) {
      params.categoryIds = selectedCategoryIds;
    }

    return params;
  };

  // Fetch artist's artworks - only when user is loaded
  const artworkParams = buildArtworkParams();
  const {
    data: artworksResponse,
    isLoading: isLoadingArtworks,
    isFetching: isFetchingArtworks,
    error: artworksError,
  } = useArtworks(artworkParams || undefined);

  // Debug: Log artwork fetching
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🖼️ Artworks fetch state:", {
        artworkParams,
        artworksResponse,
        isLoadingArtworks,
        artworksError,
        profileArtworks: user?.artworks,
        profileArtworkCount: user?.artworkCount,
      });
    }
  }, [artworkParams, artworksResponse, isLoadingArtworks, artworksError, user]);

  // Use only paginated artworks from the separate query (no fallback to profile artworks)
  // Memoize to prevent creating new array reference on every render (causes flickering)
  // Use a stable reference by checking if the data actually changed
  const artworks = useMemo(() => {
    const arts = artworksResponse?.artworks || [];
    return arts;
  }, [
    artworksResponse?.artworks?.length,
    artworksResponse?.artworks?.map(a => `${a.id}-${a.photos?.[0] || ''}`).join('|')
  ]);
  const artworksTotal = artworksResponse?.total || 0;
  const artworksPages = artworksResponse?.pages || 1;

  // Debug: Log pagination info
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("📄 Pagination Debug:", {
        artworksTotal,
        artworksPages,
        artworksLength: artworks.length,
        page,
        limit: 20,
        shouldShowPagination: artworksPages > 1,
        artworksResponse,
      });
    }
  }, [artworksTotal, artworksPages, artworks.length, page, artworksResponse]);

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
  const blogsPages = blogsResponse?.page || 1;

  // Fetch artist's collections (only public)
  const { data: collectionsResponse, isLoading: isLoadingCollections } =
    useGetUserCollections(id || "", collectionPage, 12, "public");
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
      <ArtistProfileEnhanced
        user={user}
        artworks={artworks}
        collectionsCount={collectionsTotal}
        blogsCount={blogsTotal}
      />
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
              status={status}
              onStatusChange={(value: string) =>
                updateSearchParams({ status: value || "APPROVED", page: 1 })
              }
            />
            <ArtworkGrid
              artworks={artworks}
              isLoading={isLoadingArtworks || isFetchingArtworks}
              onImageClick={setSelectedImage}
            />
            {/* Artworks Pagination */}
            {artworksTotal > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: page - 1 })}
                  disabled={page === 1 || artworksPages <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {artworksPages} ({artworksTotal}{" "}
                  {artworksTotal === 1 ? "artwork" : "artworks"})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: page + 1 })}
                  disabled={page >= artworksPages || artworksPages <= 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === "about" && (
          <div className="mt-8">
            <div className="max-w-4xl space-y-8">
              {/* About Section - Bio */}
              {user.bio && (
                <div className="bg-red-50/30 rounded-lg p-5 border border-red-100/50">
                  <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    About
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Artist Information Section */}
              {(user.location || user.website || user.email || user.createdAt || user.artworkCount) && (
                <div className="bg-white rounded-md p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-gray-400" />
                    <h2 className="text-base font-medium text-gray-700">
                      Artist Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Location</p>
                            <p className="text-xs text-gray-600">{user.location}</p>
                          </div>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Website</p>
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
                            >
                              {user.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.artworkCount !== undefined && user.artworkCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Artworks</p>
                            <p className="text-xs text-gray-600">
                              {user.artworkCount} {user.artworkCount === 1 ? "artwork" : "artworks"} available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {user.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Member Since</p>
                            <p className="text-xs text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Contact</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!user.bio && !user.location && !user.website && !user.email && (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-white">
                  <p className="text-gray-500">
                    {user.name || "This artist"} hasn't added any information yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
                      onClick={() =>
                        updateSearchParams({ blogPage: blogPage - 1 })
                      }
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
                      onClick={() =>
                        updateSearchParams({ blogPage: blogPage + 1 })
                      }
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
                  <div
                    key={i}
                    className="h-64 bg-gray-200 animate-pulse rounded-lg"
                  />
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
                          <h3 className="font-semibold text-lg mb-2">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{collection.artworkCount || 0} artworks</span>
                            <span className="capitalize">
                              {collection.visibility}
                            </span>
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
                      onClick={() =>
                        updateSearchParams({
                          collectionPage: collectionPage - 1,
                        })
                      }
                      disabled={collectionPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {collectionPage} of {collectionsPages} (
                      {collectionsTotal} collections)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSearchParams({
                          collectionPage: collectionPage + 1,
                        })
                      }
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
