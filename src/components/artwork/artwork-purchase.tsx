import { Button } from "@/components/ui/button";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkPurchaseProps {
  artwork: Artwork;
  onAddToCart?: () => void;
  isOwner?: boolean;
}

export const ArtworkPurchase = ({ artwork, onAddToCart, isOwner = false }: ArtworkPurchaseProps) => {
  const price = artwork.desiredPrice
    ? `US$${artwork.desiredPrice.toLocaleString()}`
    : "Price on request";

  // Don't show purchase options if user is the owner
  if (isOwner) {
    return (
      <div className="space-y-4">
        <div className="text-3xl">{price}</div>
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          This is your artwork. You can manage it using the actions panel on the right.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl">{price}</div>
      <div className="space-y-3">
        <Button
          className="w-full rounded-full bg-red-700 hover:bg-red-800 text-white"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
        {artwork.acceptPriceNegotiation && (
          <Button variant="outline" className="w-full rounded-full bg-transparent">
            Make an Offer
          </Button>
        )}
      </div>
    </div>
  );
};
