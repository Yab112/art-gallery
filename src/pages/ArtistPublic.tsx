import { AboutSection } from "@/components/artist/about-section";
import { ArtistProfile } from "@/components/artist/artist-profile";
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

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get active tab from URL query params, default to "artworks"
  const activeTab = searchParams.get("tab") || "artworks";

  // Get filter values from URL query params
  const page = parseInt(searchParams.get("page") || "1", 10);
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
    const params: any = {
      page,
      limit: 20,
      status,
    };

    // Filter by artist name
    if (user?.name) {
      params.artist = user.name;
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

  // Fetch artist's artworks
  const { data: artworksResponse, isLoading: isLoadingArtworks } = useArtworks(
    buildArtworkParams()
  );
  const artworks = artworksResponse?.artworks || [];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading artist...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">Artist not found</p>
      </div>
    );
  }

  return (
    <div className="b min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{user.name || "Artist"}</span>
          </button>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 ">
        <ArtistProfile user={user} />
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
          </>
        )}

        {activeTab === "about" && <AboutSection user={user} />}

        <SimilarArtists />

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
