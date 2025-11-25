import { useRef, useState, useEffect } from "react";
import { ArtworkGrid } from "@/components/ArtMarketplace/artwork-grid";
import { CategoryGrid } from "@/components/ArtMarketplace/category-grid";
import { SectionTitleHero } from "@/components/ArtMarketplace/hero-section";
import { SearchFilters } from "@/components/ArtMarketplace/search-filters";
import { CallToAction } from "@/components/call-to-action";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useArtworks } from "@/queries/artworkQueries";
import { useGetCategories } from "@/services/category/useGetCategories";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";
import { useAddArtworkToCollection } from "@/services/collections/useAddArtworkToCollection";
import { useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/queries/queryKeys";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Loader2, Image, Plus, Palette } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function ArtMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const artworksSectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Check if we're in "add to collection" mode
  const collectionId = searchParams.get("addToCollection");
  const isSelectionMode = !!collectionId;
  
  // Selection state
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set());
  
  // Collection operations
  const { addArtwork, isAdding } = useAddArtworkToCollection();
  const queryClient = useQueryClient();

  // Get filter values from URL query params, with defaults
  const viewMode = (searchParams.get("view") || "grid") as "grid" | "list";
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sort") || "recommended";
  const priceRange = searchParams.get("priceRange") || "price";
  const medium = searchParams.get("medium") || "medium";
  const rarity = searchParams.get("rarity") || "rarity";
  
  // Get category from URL - can be slug (from mega menu) or IDs (from filters)
  const categorySlug = searchParams.get("category") || "";
  const categoryParam = searchParams.get("categories") || "";
  const selectedCategoryIds = categoryParam
    ? categoryParam.split(",").filter((id) => id.trim() !== "")
    : [];

  // Update URL query params
  const updateSearchParams = (
    updates: Record<string, string | number | string[] | null>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        value === "price" ||
        value === "medium" ||
        value === "rarity"
      ) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        // For arrays, join with comma
        newParams.set(key, value.join(","));
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const setViewMode = (mode: "grid" | "list") => {
    updateSearchParams({ view: mode });
  };

  const setSearchQuery = (query: string) => {
    // Clear categories when user searches manually
    updateSearchParams({ search: query || null, categories: [], page: 1 });
  };

  const setSortBy = (value: string) => {
    updateSearchParams({ sort: value, page: 1 });
  };

  const setPriceRange = (value: string) => {
    updateSearchParams({
      priceRange: value === "price" ? null : value,
      page: 1,
    });
  };

  const setMedium = (value: string) => {
    updateSearchParams({ medium: value === "medium" ? null : value, page: 1 });
  };

  const setRarity = (value: string) => {
    updateSearchParams({ rarity: value === "rarity" ? null : value, page: 1 });
  };

  // Fetch categories from backend
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategories();
  
  // Transform categories to CategoryGrid format
  const categories = (categoriesData || []).map((category) => ({
    id: category.id,
    name: category.name,
    image: category.image || "/placeholder.svg",
    count: (category.artworkCount || 0).toLocaleString(),
  }));

  // Convert category slug to category ID if category slug is provided (from mega menu)
  useEffect(() => {
    if (categorySlug && categoriesData && categoriesData.length > 0) {
      const category = categoriesData.find((cat) => cat.slug === categorySlug);
      if (category && !selectedCategoryIds.includes(category.id)) {
        // Update URL to use category ID instead of slug
        updateSearchParams({ 
          category: null, // Remove slug param
          categories: [category.id], // Add category ID
          page: 1 
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, categoriesData]);

  // Build query params from filters
  const buildQueryParams = () => {
    const params: any = {
      page,
      limit: 8,
      // status: "APPROVED",
    };

    // Handle category filter - if categories are selected, use categoryIds array
    if (selectedCategoryIds.length > 0) {
      params.categoryIds = selectedCategoryIds;
    }
    
    // Use search query if provided (can be combined with category filter)
    if (searchQuery) {
      params.search = searchQuery;
    }

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

    // Map medium filter to support (removed technique, using support instead)
    if (medium !== "medium" && medium) {
      params.support = medium;
    }

    return params;
  };

  // Fetch artworks from backend with filters (including category filter)
  const {
    data: filteredArtworksData,
    isLoading: isLoadingFilteredArtworks,
    error: filteredArtworksError,
  } = useArtworks(buildQueryParams());

  const artworksData = filteredArtworksData;
  const isLoading = isLoadingFilteredArtworks;
  const error = filteredArtworksError;

  const { addFavorite } = useAddFavorite();

  const handleFavorite = async (id: string) => {
    try {
      // For now, just add to favorites. You can check if favorited first using useCheckFavorite
      await addFavorite(id);
    } catch (error) {
      // Error is handled by the mutation hook (toast)
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleToggleSelection = (artworkId: string) => {
    setSelectedArtworkIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(artworkId)) {
        newSet.delete(artworkId);
      } else {
        newSet.add(artworkId);
      }
      return newSet;
    });
  };

  const handleAddToCollection = async () => {
    if (!collectionId || selectedArtworkIds.size === 0) {
      toast.error("Please select at least one artwork");
      return;
    }

    try {
      // Add all selected artworks to the collection
      const promises = Array.from(selectedArtworkIds).map((artworkId) =>
        addArtwork(collectionId, artworkId)
      );

      await Promise.all(promises);

      // Invalidate collection queries
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });

      toast.success(`Added ${selectedArtworkIds.size} artwork(s) to collection`);
      
      // Redirect back to collection detail page
      navigate(`/collections/${collectionId}`);
    } catch (error: any) {
      console.error("Failed to add artworks to collection:", error);
      toast.error("Failed to add some artworks to the collection");
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    // Toggle category selection - add if not selected, remove if already selected
    const newSelectedIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    updateSearchParams({ categories: newSelectedIds, page: 1 });
    
    // Scroll to artworks section if a category is selected (user-initiated)
    if (newSelectedIds.length > 0 && artworksSectionRef.current) {
      requestAnimationFrame(() => {
        if (artworksSectionRef.current) {
          const elementPosition = artworksSectionRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 20; // 20px offset from top
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      });
    }
  };


  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
    // Scroll to top of artworks section when page changes
    if (artworksSectionRef.current) {
      artworksSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Transform backend data to match component props
  const artworks =
    artworksData?.artworks?.map((artwork) => {
      // Get first photo, or null if no photos exist
      const firstPhoto = artwork.photos?.[0];
      // Only use photo if it's a valid URL string
      const imageUrl = firstPhoto && typeof firstPhoto === 'string' && firstPhoto.trim() !== '' 
        ? firstPhoto 
        : null;
      
      return {
      id: artwork.id,
        image: imageUrl || "", // Empty string will trigger placeholder in ArtworkCard
      title: artwork.title || "Untitled",
      artist: artwork.artist,
      price: `US$${artwork.desiredPrice?.toLocaleString() || "0"}`,
      year: artwork.yearOfArtwork,
      medium: artwork.support, // Changed from technique to support
      dimensions: artwork.dimensions
        ? `${artwork.dimensions.width} × ${artwork.dimensions.height} in`
        : "N/A",
      seller: artwork.user?.name || "Unknown",
      };
    }) || [];

  return (
    <div className="min-h-screen bg-white">
      <SectionTitleHero
        title="Collect art and design online"
        subtitle="Discover exceptional artworks from galleries, artists, and collectors worldwide"
        buttonText="Browse by collection"
      />

      {isLoadingCategories ? (
        <div className="px-4 pb-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-3 aspect-[4/3] rounded-lg bg-gray-200" />
                  <div className="h-4 w-20 rounded bg-gray-200 mb-2" />
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <CategoryGrid
          categories={categories}
          onCategorySelect={handleCategorySelect}
          selectedCategoryIds={selectedCategoryIds}
        />
      ) : null}

      {/* Artworks Header Section */}
      <div className="px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Palette className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Artworks</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {artworksData?.total || 0}{" "}
                  {artworksData?.total === 1 ? "artwork" : "artworks"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile/my-artworks")}
                  className="rounded-full flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  My Artworks
                </Button>
              )}
              <Button
                onClick={() => navigate("/sellart")}
                className="bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Artwork
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        artworkCount={artworksData?.total || 0}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        medium={medium}
        onMediumChange={setMedium}
        rarity={rarity}
        onRarityChange={setRarity}
      />

      {/* Selection Mode Banner */}
      {isSelectionMode && (
        <div className="sticky top-[73px] z-40 bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {selectedArtworkIds.size > 0 ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5 text-blue-600" />
                )}
                <span className="text-sm font-medium text-blue-900">
                  {selectedArtworkIds.size} artwork{selectedArtworkIds.size !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("addToCollection");
                  setSearchParams(newParams);
                  setSelectedArtworkIds(new Set());
                }}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCollection}
                disabled={selectedArtworkIds.size === 0 || isAdding}
                className="text-xs"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add to Collection (${selectedArtworkIds.size})`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div ref={artworksSectionRef} className="min-h-[500px]">
      {isLoading ? (
          <div className="px-4 py-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <p className="text-gray-600">Loading artworks...</p>
              </div>
              {/* Skeleton loader matching grid layout */}
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "space-y-4"}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] rounded-lg bg-gray-200 mb-3" />
                    <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
                    <div className="h-3 w-1/2 rounded bg-gray-200 mb-1" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
        </div>
      ) : error ? (
          <div className="flex items-center justify-center py-12 min-h-[500px]">
          <p className="text-red-600">
            Failed to load artworks. Please try again.
          </p>
        </div>
      ) : artworks.length > 0 ? (
        <ArtworkGrid
          artworks={artworks}
          viewMode={viewMode}
          onFavorite={handleFavorite}
          currentPage={artworksData?.page ?? page ?? 1}
          totalPages={Math.max(artworksData?.pages ?? 1, 1)}
          onPageChange={handlePageChange}
          isSelectionMode={isSelectionMode}
          selectedArtworkIds={selectedArtworkIds}
          onToggleSelection={handleToggleSelection}
        />
      ) : (
          <div className="min-h-[500px]">
        <ArtworkGrid
          artworks={[]}
          viewMode={viewMode}
          onFavorite={handleFavorite}
        />
          </div>
      )}
      </div>

      <CallToAction
        title="Start Your Collection Today"
        subtitle="Join thousands of collectors discovering exceptional art"
        primaryButtonText="Discover Artists"
        secondaryButtonText="Browse Collections"
      />
    </div>
  );
}
