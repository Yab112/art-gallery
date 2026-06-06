import { ArtistDetailSkeleton } from "@/components/artist/artist-detail-skeleton";
import { ArtistProfileEnhanced } from "@/components/artist/artist-profile-enhanced";
import { ArtworkGrid } from "@/components/artist/artwork-grid";
import { FilterControls } from "@/components/artist/filter-controls";
import { ImageModal } from "@/components/artist/image-modal";
import { NavigationTabs } from "@/components/artist/navigation-tabs";
import { SimilarArtists } from "@/components/artist/similar-artists";
import { ArtistBlogPreview } from "@/components/blog/artist-blog-preview";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useArtworks } from "@/queries/artworkQueries";
import { useUser } from "@/queries/userQueries";
import { useGetBlogPosts } from "@/services/blog";
import { useGetUserCollections } from "@/services/collections/useGetUserCollections";
import {
  ArrowLeft,
  Award,
  Calendar,
  FolderOpen,
  Globe,
  Mail,
  MapPin,
  Palette,
  Phone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [collectionImageErrors, setCollectionImageErrors] = useState<
    Record<string, boolean>
  >({});

  // Get active tab from URL query params, default to "artworks"
  const activeTab = searchParams.get("tab") || "artworks";

  // Get filter values from URL query params
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const collectionPage = Number.parseInt(
    searchParams.get("collectionPage") || "1",
    10,
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
    updates: Record<string, string | number | string[] | null>,
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
      // "ALL" means no status filter – omit the field so backend returns everything
      ...(status && status !== "ALL" ? { status } : {}),
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
    artworksResponse?.artworks
      ?.map((a) => `${a.id}-${a.photos?.[0] || ""}`)
      .join("|"),
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

  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === id;

  // Fetch blog count for profile header
  const { data: blogsMeta } = useGetBlogPosts({
    authorId: id,
    published: isOwnProfile ? undefined : true,
    status: isOwnProfile ? undefined : "APPROVED",
    page: 1,
    limit: 1,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });
  const blogsTotal = blogsMeta?.total || 0;

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
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
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
              <PaginationControls
                currentPage={page}
                totalPages={artworksPages}
                onPageChange={(nextPage) =>
                  updateSearchParams({ page: nextPage })
                }
                totalItems={artworksTotal}
                itemLabel="artworks"
                itemLabelSingular="artwork"
                showSinglePageSummary={artworksPages <= 1}
              />
            )}
          </>
        )}

        {activeTab === "about" && (
          <div className="mt-8">
            <div className="max-w-4xl space-y-8">
              {/* About Section - Bio */}
              {user.bio && (
                <div className="rounded-lg border border-red-100/50 bg-red-50/30 p-5">
                  <h3 className="mb-2 font-medium text-gray-500 text-xs uppercase tracking-wide">
                    About
                  </h3>
                  <p className="whitespace-pre-line text-gray-600 text-sm leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Artist Information Section */}
              {(user.location ||
                user.website ||
                user.email ||
                user.phone ||
                user.createdAt ||
                user.artworkCount) && (
                <div className="rounded-md border border-gray-100 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <h2 className="font-medium text-base text-gray-700">
                      Artist Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {user.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Location
                            </p>
                            <p className="text-gray-600 text-xs">
                              {user.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Website
                            </p>
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 text-xs transition-colors hover:text-red-700 hover:underline"
                            >
                              {user.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.artworkCount !== undefined &&
                        user.artworkCount > 0 && (
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                Artworks
                              </p>
                              <p className="text-gray-600 text-xs">
                                {user.artworkCount}{" "}
                                {user.artworkCount === 1
                                  ? "artwork"
                                  : "artworks"}{" "}
                                available
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
                            <p className="font-medium text-gray-900 text-sm">
                              Member Since
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Phone
                            </p>
                            <a
                              href={`tel:${user.phone}`}
                              className="text-gray-600 text-xs transition-colors hover:text-red-600"
                            >
                              {user.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Contact
                            </p>
                            <p className="text-gray-600 text-xs">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!user.bio &&
                !user.location &&
                !user.website &&
                !user.email &&
                !user.phone && (
                  <div className="rounded-lg border border-gray-300 border-dashed bg-white py-12 text-center">
                    <p className="text-gray-500">
                      {user.name || "This artist"} hasn't added any information
                      yet.
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {activeTab === "blog" && (
          <ArtistBlogPreview
            authorId={id || ""}
            authorName={user.name}
            limit={4}
            published={isOwnProfile ? undefined : true}
            status={isOwnProfile ? undefined : "APPROVED"}
            className="mt-8"
          />
        )}

        {activeTab === "collections" && (
          <div className="mt-8">
            {isLoadingCollections ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-lg bg-gray-200"
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collections/${collection.id}`}
                      className="block"
                    >
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
                        {collection.coverImage &&
                        !collectionImageErrors[collection.id] ? (
                          <img
                            src={collection.coverImage}
                            alt={collection.name}
                            className="h-48 w-full object-cover"
                            onError={() =>
                              setCollectionImageErrors((prev) => ({
                                ...prev,
                                [collection.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                            <FolderOpen className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="mb-2 font-semibold text-lg">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="mb-3 line-clamp-2 text-gray-600 text-sm">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-gray-500 text-xs">
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
                  <PaginationControls
                    currentPage={collectionPage}
                    totalPages={collectionsPages}
                    onPageChange={(nextPage) =>
                      updateSearchParams({ collectionPage: nextPage })
                    }
                    totalItems={collectionsTotal}
                    itemLabel="collections"
                    itemLabelSingular="collection"
                  />
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
