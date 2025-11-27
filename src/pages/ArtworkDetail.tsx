import { ArtworkActions } from "@/components/artwork/artwork-actions";
import { ArtworkCollapsibles } from "@/components/artwork/artwork-collapsibles";
import { ArtworkDetails } from "@/components/artwork/artwork-details";
import { ArtworkGalleryInfo } from "@/components/artwork/artwork-galleryInfo";
import { ArtworkImage } from "@/components/artwork/artwork-image";
import { ArtworkPurchase } from "@/components/artwork/artwork-purchase";
import { RelatedArtworks } from "@/components/artwork/related-artwork";
import { SimilarArtworks } from "@/components/artwork/similar-artworks";
import { UserBlogs } from "@/components/artwork/user-blogs";
import { MoreArtworksFromUser } from "@/components/artwork/more-artworks-from-user";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
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
import { ArtworkDetailSkeleton } from "@/components/skeletons/artwork-detail-skeleton";

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
    return <ArtworkDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 text-base font-semibold mb-1.5">
            Failed to load artwork
          </p>
          <p className="text-gray-600 text-sm mb-3">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <Button size="sm" onClick={() => window.location.reload()} className="text-xs">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-600 text-base font-semibold mb-1.5">
            Artwork not found
          </p>
          <p className="text-gray-600 text-sm mb-3">
            This artwork doesn't exist or has been removed.
          </p>
          <Button size="sm" onClick={() => navigate("/buyart")} className="text-xs">
            Browse Artworks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{artwork.artist || artwork.user?.name || "Artist"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        <div className="mx-auto max-w-7xl">
          {isOwner ? (
            // Owner View - Two Column Layout with Owner Panel
            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
              {/* Left Column - Artwork Image & Actions */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  {/* Left Column - Artwork Image */}
                  <div className="space-y-3">
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
                  <div className="space-y-3">
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
                <RelatedArtworks 
                  artworkId={id || ""} 
                  artist={artwork.artist}
                  categoryIds={artwork.categories}
                />
                <SimilarArtworks artworkId={id || ""} />
                {artwork.userId && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Blog Posts</h3>
                      {user && artwork.userId === user.id && <CreateBlogModal />}
                    </div>
                    <UserBlogs userId={artwork.userId} />
                  </>
                )}
              </div>
              {/* Right Column - Owner Panel */}
              <div className="lg:col-span-1">
                <ArtworkOwnerPanel artwork={artwork} />
              </div>
            </div>
          ) : (
            // Public View - Standard Layout
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              {/* Left Column - Artwork Image */}
              <div className="space-y-3">
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
              <div className="space-y-3">
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
            <div className="mt-4 space-y-3">
              <ArtworkAbout artwork={artwork} isOwner={isOwner} />
              <RelatedArtworks 
                artworkId={id || ""} 
                artist={artwork.artist}
                categoryIds={artwork.categories}
              />
              <SimilarArtworks artworkId={id || ""} />
              {artwork.userId && (
                <>
                  <div className="flex items-center justify-between mb-4 mt-8">
                    <h3 className="text-lg font-semibold">Blog Posts by This Artist</h3>
                    {user && artwork.userId === user.id && <CreateBlogModal />}
                  </div>
                  <UserBlogs userId={artwork.userId} />
                  <MoreArtworksFromUser 
                    userId={artwork.userId} 
                    currentArtworkId={id || ""}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
