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
    <div className="border-t pt-6">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-bold">{artwork.user?.name || artwork.artist || "Gallery"}</h3>
          <p className="text-muted-foreground text-sm">{artwork.user?.email || "Contact information"}</p>
        </div>
        {!isOwner && (
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
            onClick={handleContactGallery}
          >
            Contact Gallery
          </Button>
        )}
      </div>
    </div>
  );
};
