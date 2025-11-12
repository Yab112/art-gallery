import { ArtworkActions } from "@/components/artwork/artwork-actions";
import { ArtworkCollapsibles } from "@/components/artwork/artwork-collapsibles";
import { ArtworkDetails } from "@/components/artwork/artwork-details";
import { ArtworkGalleryInfo } from "@/components/artwork/artwork-galleryInfo";
import { ArtworkImage } from "@/components/artwork/artwork-image";
import { ArtworkPurchase } from "@/components/artwork/artwork-purchase";
import { RelatedArtworks } from "@/components/artwork/related-artwork";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArtworkAbout } from "../components/artwork/artwork-about";
import { useArtwork } from "@/queries/artworkQueries";
import type { Artwork } from "@/types/artwork.types";
import { useCheckFavorite } from "@/queries/favoriteQueries";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite";
import { useAddToCart } from "@/services/cart/useAddToCart";
import { ArtworkCollectionManager } from "@/components/artwork/artwork-collection-manager";
import { ArtworkOwnerPanel } from "@/components/artwork/artwork-owner-panel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

export default function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isGuaranteeOpen, setIsGuaranteeOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch artwork data
  const { data: artworkResponse, isLoading, error } = useArtwork(id || "");
  
  // Debug: Log the response to see what we're getting
  useEffect(() => {
    if (artworkResponse) {
      console.log("Artwork Response:", artworkResponse);
      console.log("Artwork Data:", artworkResponse?.artwork);
    }
  }, [artworkResponse]);
  
  // Handle different response formats
  // Backend returns { success: true, artwork } or just artwork directly
  const artwork = artworkResponse?.artwork 
    ? artworkResponse.artwork 
    : (artworkResponse && typeof artworkResponse === 'object' && 'id' in artworkResponse)
    ? artworkResponse as Artwork
    : undefined;
  
  // Check if artwork is favorited
  const { data: favoriteCheck } = useCheckFavorite(id || "");
  const isSaved = favoriteCheck?.isFavorite || false;

  // Check if user is the owner
  const isOwner = artwork?.userId === user?.id;

  // Mutations
  const { addFavorite } = useAddFavorite();
  const { removeFavorite } = useRemoveFavorite();
  const { addToCart } = useAddToCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = async () => {
    if (!id) return;
    try {
      if (isSaved) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!id) return;
    try {
      await addToCart({ artworkId: id, quantity: 1 });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading artwork...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">
            Failed to load artwork
          </p>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!artwork || !artwork.id) {
    // Log for debugging
    console.log("Artwork Response:", artworkResponse);
    console.log("Artwork:", artwork);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
    
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">
            Artwork not found
          </p>
          <p className="text-gray-600 mb-4">
            This artwork doesn't exist or has been removed.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Response: {JSON.stringify(artworkResponse, null, 2)}
          </p>
          <Button onClick={() => navigate("/buyart")}>
            Browse Artworks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{artwork.artist || artwork.user?.name || "Artist"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="l px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {isOwner ? (
            // Owner View - Two Column Layout with Owner Panel
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
              {/* Left Column - Artwork Image & Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                  {/* Left Column - Artwork Image */}
                  <div className="space-y-6">
                    <ArtworkImage
                      src={artwork.photos?.[0] || "/placeholder.svg"}
                      alt={`${artwork.title || "Untitled"} by ${artwork.artist}`}
                    />
                    <ArtworkActions
                      isSaved={isSaved}
                      onSave={handleSave}
                    />
                    {user && (
                      <ArtworkCollectionManager artworkId={id || ""} />
                    )}
                  </div>
                  {/* Right Column - Artwork Details */}
                  <div className="space-y-4">
                    <ArtworkDetails artwork={artwork} />
                    <ArtworkPurchase artwork={artwork} onAddToCart={handleAddToCart} isOwner={isOwner} />
                    <ArtworkCollapsibles
                      artwork={artwork}
                      isShippingOpen={isShippingOpen}
                      setIsShippingOpen={setIsShippingOpen}
                      isGuaranteeOpen={isGuaranteeOpen}
                      setIsGuaranteeOpen={setIsGuaranteeOpen}
                    />
                    <ArtworkGalleryInfo artwork={artwork} isOwner={isOwner} />
                  </div>
                </div>
                <ArtworkAbout artwork={artwork} isOwner={isOwner} />
                <RelatedArtworks artworkId={id || ""} />
              </div>
              {/* Right Column - Owner Panel */}
              <div className="lg:col-span-1">
                <ArtworkOwnerPanel artwork={artwork} />
              </div>
            </div>
          ) : (
            // Public View - Standard Layout
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left Column - Artwork Image */}
              <div className="space-y-6">
                <ArtworkImage
                  src={artwork.photos?.[0] || "/placeholder.svg"}
                  alt={`${artwork.title || "Untitled"} by ${artwork.artist}`}
                />
                <ArtworkActions
                  isSaved={isSaved}
                  onSave={handleSave}
                />
                {user && (
                  <ArtworkCollectionManager artworkId={id || ""} />
                )}
              </div>
              {/* Right Column - Artwork Details */}
              <div className="space-y-4">
                <ArtworkDetails artwork={artwork} />
                <ArtworkPurchase artwork={artwork} onAddToCart={handleAddToCart} isOwner={isOwner} />
                <ArtworkCollapsibles
                  artwork={artwork}
                  isShippingOpen={isShippingOpen}
                  setIsShippingOpen={setIsShippingOpen}
                  isGuaranteeOpen={isGuaranteeOpen}
                  setIsGuaranteeOpen={setIsGuaranteeOpen}
                />
                <ArtworkGalleryInfo artwork={artwork} isOwner={isOwner} />
              </div>
            </div>
          )}
          {!isOwner && (
            <>
              <ArtworkAbout artwork={artwork} isOwner={isOwner} />
              <RelatedArtworks artworkId={id || ""} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
