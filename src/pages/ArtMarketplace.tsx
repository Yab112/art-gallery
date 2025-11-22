import { useRef } from "react";
import { ArtworkGrid } from "@/components/ArtMarketplace/artwork-grid";
import { CategoryGrid } from "@/components/ArtMarketplace/category-grid";
import { SectionTitleHero } from "@/components/ArtMarketplace/hero-section";
import { SearchFilters } from "@/components/ArtMarketplace/search-filters";
import { CallToAction } from "@/components/call-to-action";
import { useSearchParams } from "react-router-dom";
import { useArtworks } from "@/queries/artworkQueries";
import { useCollections, useCollectionArtworks } from "@/queries/collectionQueries";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";

export default function ArtMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const artworksSectionRef = useRef<HTMLDivElement>(null);

  // Get filter values from URL query params, with defaults
  const viewMode = (searchParams.get("view") || "grid") as "grid" | "list";
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sort") || "recommended";
  const priceRange = searchParams.get("priceRange") || "price";
  const medium = searchParams.get("medium") || "medium";
  const rarity = searchParams.get("rarity") || "rarity";
  const category = searchParams.get("category") || "";

  // Update URL query params
  const updateSearchParams = (
    updates: Record<string, string | number | null>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        value === "price" ||
        value === "medium" ||
        value === "rarity"
      ) {
        newParams.delete(key);
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
    // Clear category when user searches manually
    updateSearchParams({ search: query || null, category: null, page: 1 });
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

  // Fetch collections from backend to use as categories
  // Using default (public) - only public collections will be shown
  const { data: collectionsData, isLoading: isLoadingCollections } = useCollections(1, 20, "all");
  
  // Handle backend response format: { success: true, collections: [...], pagination: {...} }
  // or transformed format: { collections: [...], page, limit, total, pages }
  const collections = collectionsData?.collections || [];
  
  // Transform collections to categories format
  const categories = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    image: collection.coverImage || "/placeholder.svg",
    count: (collection.artworkCount || 0).toLocaleString(),
  }));

  // Map category (collection) to backend query parameters
  // When a collection is selected, we'll filter by collection name in the search
  const getCategoryFilter = (categoryId: string) => {
    // Find the collection by ID
    const selectedCollection = collections.find(
      (c) => c.id === categoryId
    );
    
    if (selectedCollection) {
      // Use collection name for search filtering
      return { search: selectedCollection.name };
    }
    
    return null;
  };

  // Build query params from filters
  const buildQueryParams = () => {
    const params: any = {
      page,
      limit: 8,
      // status: "APPROVED",
    };

    // Handle category filter - if category is selected, use it; otherwise use search query
    if (category) {
      const categoryFilter = getCategoryFilter(category);
      if (categoryFilter?.search) {
        params.search = categoryFilter.search;
      }
    } else if (searchQuery) {
      // Only use search query if no category is selected
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

    // Map medium filter to technique (only if category doesn't already set technique)
    if (medium !== "medium" && !category) {
      params.technique = medium;
    }

    return params;
  };

  // Fetch artworks from backend
  // If a collection is selected, fetch artworks from that collection
  // Otherwise, fetch artworks with filters
  const {
    data: collectionArtworksData,
    isLoading: isLoadingCollectionArtworks,
    error: collectionArtworksError,
  } = useCollectionArtworks(category || "", page, 8);

  const {
    data: filteredArtworksData,
    isLoading: isLoadingFilteredArtworks,
    error: filteredArtworksError,
  } = useArtworks(buildQueryParams());

  // Use collection artworks if category is selected, otherwise use filtered artworks
  const artworksData = category ? collectionArtworksData : filteredArtworksData;
  const isLoading = category ? isLoadingCollectionArtworks : isLoadingFilteredArtworks;
  const error = category ? collectionArtworksError : filteredArtworksError;

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

  const handleCategorySelect = (categoryId: string) => {
    // Update URL with category filter and clear search query
    // If clicking the same category, clear it (toggle off)
    const newCategory = categoryId === category ? null : categoryId;
    updateSearchParams({ category: newCategory || null, search: null, page: 1 });
    
    // Scroll to artworks section if a collection is selected (user-initiated)
    if (newCategory && artworksSectionRef.current) {
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
      medium: artwork.technique,
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

      {isLoadingCollections ? (
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
      />
      ) : null}

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
