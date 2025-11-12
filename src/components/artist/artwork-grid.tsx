import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "lucide-react";
import type { Artwork } from "@/types/artwork.types";

interface ArtworkGridProps {
  artworks: Artwork[];
  isLoading?: boolean;
  onImageClick: (src: string) => void;
}

export function ArtworkGrid({ artworks, isLoading, onImageClick }: ArtworkGridProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-12 flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  // Show empty state
  if (artworks.length === 0) {
    return (
      <div className="mt-12">
        <EmptyState
          icon={Palette}
          title="No Artworks Yet"
          description="This artist hasn't uploaded any artworks yet. Check back soon to see their collection."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid">
            <ArtworkCard
              isMasonry
              id={artwork.id}
              image={artwork.photos?.[0] || "/placeholder.svg"}
              title={artwork.title || "Untitled"}
              artist={artwork.artist}
              price={`US$${artwork.desiredPrice?.toLocaleString() || "0"}`}
              year={artwork.yearOfArtwork}
              medium={artwork.technique}
              dimensions={
                artwork.dimensions
                  ? `${artwork.dimensions.width} × ${artwork.dimensions.height} in`
                  : "N/A"
              }
              seller={artwork.user?.name || "Unknown"}
              onImageClick={onImageClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
