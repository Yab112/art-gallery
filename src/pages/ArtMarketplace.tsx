import { ArtworkGrid } from "@/components/artMarketplace/artwork-grid";
import { CategoryGrid } from "@/components/artMarketplace/category-grid";
import { SectionTitleHero } from "@/components/artMarketplace/hero-section";
import { SearchFilters } from "@/components/artMarketplace/search-filters";
import { CallToAction } from "@/components/call-to-action";
import { useSearchParams } from "react-router-dom";
import { useArtworks } from "@/queries/artworkQueries";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";

const categories = [
  {
    id: "contemporary",
    name: "Contemporary Art",
    image: "/artwork-1.jpg",
    count: "1,234",
  },
  {
    id: "painting",
    name: "Painting",
    image: "/artwork-1.jpg",
    count: "2,567",
  },
  {
    id: "street",
    name: "Street Art",
    image: "/artwork-2.jpg",
    count: "892",
  },
  {
    id: "photography",
    name: "Photography",
    image: "/artwork-3.jpg",
    count: "1,456",
  },
  {
    id: "emerging",
    name: "Emerging Art",
    image: "/artwork-4.jpg",
    count: "678",
  },
  {
    id: "20th-century",
    name: "20th-Century Art",
    image: "/artwork-5.jpg",
    count: "3,234",
  },
];

export default function ArtMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

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
    updateSearchParams({ search: query || null, page: 1 });
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

  // Build query params from filters
  const buildQueryParams = () => {
    const params: any = {
      page,
      limit: 12,
      status: "APPROVED",
      search: searchQuery || undefined,
    };

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

    // Map medium filter to technique
    if (medium !== "medium") {
      params.technique = medium;
    }

    // Map category filter (if implemented in backend)
    if (category) {
      // You can add category filtering here when backend supports it
      // params.category = category;
    }

    return params;
  };

  // Fetch artworks from backend
  const {
    data: artworksData,
    isLoading,
    error,
  } = useArtworks(buildQueryParams());

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
    // Update URL with category filter
    updateSearchParams({ category: categoryId || null, page: 1 });
  };

  const handleLoadMore = () => {
    updateSearchParams({ page: page + 1 });
  };

  // Transform backend data to match component props
  const artworks =
    artworksData?.artworks?.map((artwork) => ({
      id: artwork.id,
      image: artwork.photos?.[0] || "/placeholder.svg",
      title: artwork.title || "Untitled",
      artist: artwork.artist,
      price: `US$${artwork.desiredPrice?.toLocaleString() || "0"}`,
      year: artwork.yearOfArtwork,
      medium: artwork.technique,
      dimensions: artwork.dimensions
        ? `${artwork.dimensions.width} × ${artwork.dimensions.height} in`
        : "N/A",
      seller: artwork.user?.name || "Unknown",
    })) || [];

  return (
    <div className="min-h-screen bg-white">
      <SectionTitleHero
        title="Collect art and design online"
        subtitle="Discover exceptional artworks from galleries, artists, and collectors worldwide"
        buttonText="Browse by collection"
      />

      <CategoryGrid
        categories={categories}
        onCategorySelect={handleCategorySelect}
      />

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading artworks...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-600">
            Failed to load artworks. Please try again.
          </p>
        </div>
      ) : artworks.length > 0 ? (
        <ArtworkGrid
          artworks={artworks}
          viewMode={viewMode}
          onFavorite={handleFavorite}
          onLoadMore={
            artworksData && page < artworksData.pages
              ? handleLoadMore
              : undefined
          }
        />
      ) : (
        <ArtworkGrid
          artworks={[]}
          viewMode={viewMode}
          onFavorite={handleFavorite}
        />
      )}

      <CallToAction
        title="Start Your Collection Today"
        subtitle="Join thousands of collectors discovering exceptional art"
        primaryButtonText="Discover Artists"
        secondaryButtonText="Browse Collections"
      />
    </div>
  );
}
