import { SectionTitle } from "@/components/section-title";
import { ArtworkCard } from "../artwork-card";
import { useSimilarArtworks } from "@/queries/artworkQueries";
import { mapArtworkToCardProps } from "@/lib/utils/artwork-mapper";
import { useMemo } from "react";

interface RelatedArtworksProps {
  artworkId: string;
}

export function RelatedArtworks({ artworkId }: RelatedArtworksProps) {
  // Fetch similar artworks based on the artwork's categories
  const { data: similarData, isLoading, error } = useSimilarArtworks(artworkId, 12);

  const artworks = useMemo(() => {
    if (!similarData?.artworks) return [];
    const mapped = similarData.artworks.map(mapArtworkToCardProps);
    // Ensure uniqueness by ID (additional safeguard)
    const unique = mapped.filter((artwork, index, self) =>
      index === self.findIndex((a) => a.id === artwork.id)
    );
    if (mapped.length !== unique.length) {
      console.warn(`Duplicate artworks detected: ${mapped.length} -> ${unique.length} unique`);
    }
    return unique;
  }, [similarData]);

  // Don't render if no artworks found or if there's an error
  if (!isLoading && artworks.length === 0) {
    return null;
  }

  // Don't render if there's an error (silently fail)
  if (error) {
    return null;
  }

  return (
    <section className="py-4">
      <SectionTitle
        title="Similar Artworks"
        subtitle="Discover artworks that match this artwork's style"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-6 mt-4">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-gray-600" />
        </div>
      ) : (
        /* Masonry Grid Layout */
        <div className="mt-4 columns-1 gap-3 space-y-3 md:columns-2 lg:columns-3 xl:columns-4">
          {artworks.map((artwork: any) => (
            <div key={artwork.id} className="break-inside-avoid">
              <ArtworkCard isMasonry {...artwork} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
