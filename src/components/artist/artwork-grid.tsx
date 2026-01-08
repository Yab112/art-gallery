import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "lucide-react";
import type { Artwork } from "@/types/artwork.types";
import { ArtworkGridSkeleton } from "./artwork-grid-skeleton";

interface ArtworkGridProps {
  artworks: Artwork[];
  isLoading?: boolean;
  onImageClick: (src: string) => void;
}

export function ArtworkGrid({ artworks, isLoading, onImageClick }: ArtworkGridProps) {
  // Show loading state
  if (isLoading) {
    return <ArtworkGridSkeleton />;
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
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {artworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
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
            status={artwork.status}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
}
