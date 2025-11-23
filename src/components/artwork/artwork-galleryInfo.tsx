import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkGalleryInfoProps {
  artwork: Artwork;
  isOwner?: boolean;
}

export const ArtworkGalleryInfo = ({ artwork, isOwner = false }: ArtworkGalleryInfoProps) => {
  const navigate = useNavigate();

  const handleContactGallery = () => {
    if (artwork.user?.id) {
      navigate(`/artist/${artwork.user.id}`);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{artwork.user?.name || artwork.artist || "Gallery"}</h3>
          <p className="text-gray-500 text-xs">{artwork.user?.email || "Contact information"}</p>
        </div>
        {!isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
            onClick={handleContactGallery}
          >
            Contact Gallery
          </Button>
        )}
      </div>
    </div>
  );
};
