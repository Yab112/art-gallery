import { SectionTitle } from "@/components/section-title";
import { ArtworkCard } from "../artwork-card";
import { useSimilarArtworksByCategory } from "@/queries/useSimilarArtworksByCategory";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artwork } from "@/types/artwork.types";

interface SimilarArtworksProps {
  artworkId: string;
}

const formatPrice = (price: number): string => {
  return `€${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDimensions = (dimensions: Artwork["dimensions"]): string => {
  if (!dimensions) return "N/A";
  if (typeof dimensions === "object" && "width" in dimensions && "height" in dimensions) {
    const { width, height, depth } = dimensions;
    return depth ? `${width} × ${height} × ${depth} cm` : `${width} × ${height} cm`;
  }
  return "N/A";
};

export function SimilarArtworks({ artworkId }: SimilarArtworksProps) {
  const { data: similarArtworks, isLoading } = useSimilarArtworksByCategory(
    artworkId,
    8
  );

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section - Similar Artworks Skeleton */}
          <div>
            <SectionTitle title="Similar Artworks" />
            {/* Masonry Grid Layout Skeleton */}
            <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid space-y-3">
                  <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
          {/* Right Section - Empty */}
          <div></div>
        </div>
      </section>
    );
  }

  if (!similarArtworks || similarArtworks.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section - Similar Artworks */}
        <div>
          <SectionTitle title="Similar Artworks" />
          {/* Masonry Grid Layout */}
          <div className="mt-12 columns-1 gap-6 space-y-6 md:columns-2 lg:columns-2">
            {similarArtworks.map((artwork) => (
              <div key={artwork.id} className="break-inside-avoid">
                <ArtworkCard
                  isMasonry
                  id={artwork.id}
                  image={artwork.photos?.[0] || "/placeholder.svg"}
                  title={artwork.title || "Untitled"}
                  artist={artwork.artist}
                  price={formatPrice(artwork.desiredPrice)}
                  year={artwork.yearOfArtwork}
                  medium={artwork.support}
                  dimensions={formatDimensions(artwork.dimensions)}
                  seller={artwork.user?.name || artwork.artist}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Right Section - Empty */}
        <div></div>
      </div>
    </section>
  );
}

