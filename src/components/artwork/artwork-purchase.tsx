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

  const isSold = artwork.status === "SOLD";

  // Don't show purchase options if user is the owner
  if (isOwner) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-gray-900">{price}</div>
        <div className="rounded-md bg-gray-50 border border-gray-200 p-2.5 text-xs text-gray-600">
          This is your artwork. You can manage it using the actions panel on the right.
        </div>
      </div>
    );
  }

  // Show sold message if artwork is sold
  if (isSold) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-gray-900">{price}</div>
        <div className="rounded-md bg-gray-100 border border-gray-300 p-3 text-sm text-gray-700">
          <p className="font-medium mb-1">This artwork has been sold</p>
          <p className="text-xs text-gray-600">
            This item is no longer available for purchase.
          </p>
        </div>
        <Button
          className="w-full rounded-full bg-gray-400 hover:bg-gray-400 text-white h-9 text-sm cursor-not-allowed"
          disabled
        >
          Sold Out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-2xl font-semibold text-gray-900">{price}</div>
      <div className="space-y-2">
        <Button
          className="w-full rounded-full bg-red-700 hover:bg-red-800 text-white h-9 text-sm"
          onClick={onAddToCart}
        >
          Add to Cart
        </Button>
        {artwork.acceptPriceNegotiation && (
          <Button variant="outline" className="w-full rounded-full bg-transparent h-9 text-sm">
            Make an Offer
          </Button>
        )}
      </div>
    </div>
  );
};
