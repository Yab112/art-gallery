import { useState } from "react";
import { SectionTitle } from "@/components/section-title";
import { ArtworkCard } from "../artwork-card";
import { useSimilarArtworksByCategory } from "@/queries/useSimilarArtworksByCategory";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [page, setPage] = useState(1);
  const limit = 8; // 2 rows × 4 columns = 8 items per page
  
  const { data: similarArtworks, isLoading } = useSimilarArtworksByCategory(
    artworkId,
    limit,
    page
  );

  // Calculate pagination
  const totalArtworks = similarArtworks?.length || 0;
  const totalPages = Math.ceil(totalArtworks / limit);
  const hasMore = totalArtworks >= limit;

  if (isLoading) {
    return (
      <section className="py-16">
        <SectionTitle title="Similar Artworks" />
        {/* Grid Layout Skeleton - 4 columns responsive, matches ArtworkCard structure */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="group relative space-y-3">
              {/* Image Skeleton */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-200">
                <Skeleton className="h-full w-full" />
              </div>
              
              {/* Content Skeleton */}
              <div className="space-y-2">
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />
                
                {/* Artist */}
                <Skeleton className="h-4 w-1/2" />
                
                {/* Price and Details */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Year and Medium */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!similarArtworks || similarArtworks.length === 0) {
    return null;
  }

  // Get artworks for current page
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedArtworks = similarArtworks.slice(startIndex, endIndex);

  return (
    <section className="py-16">
      <SectionTitle title="Similar Artworks" />
      
      {/* Grid Layout - 4 columns responsive, 2 rows */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedArtworks.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
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
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages} ({totalArtworks} artworks)
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

