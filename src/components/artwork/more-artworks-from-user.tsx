import { useArtworks } from "@/queries/artworkQueries";
import { ArtworkCard } from "../artwork-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle } from "@/components/section-title";
import { Palette } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Artwork } from "@/types/artwork.types";

interface MoreArtworksFromUserProps {
  userId: string;
  currentArtworkId: string;
  limit?: number;
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

export function MoreArtworksFromUser({ 
  userId, 
  currentArtworkId,
  limit = 8 
}: MoreArtworksFromUserProps) {
  const { data, isLoading } = useArtworks({
    userId,
    page: 1,
    limit: limit + 1, // Fetch one extra to exclude current artwork
    status: "APPROVED",
    sortBy: "createdAt",
    orderBy: "desc",
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <SectionTitle title="More Artworks from This Artist" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="group relative space-y-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-200">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const artworks = data?.artworks || [];
  // Filter out the current artwork
  const filteredArtworks = artworks.filter((artwork) => artwork.id !== currentArtworkId).slice(0, limit);
  const totalArtworks = data?.total || 0;

  if (filteredArtworks.length === 0) {
    return (
      <section className="py-16">
        <SectionTitle title="More Artworks from This Artist" />
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
          <EmptyState
            icon={Palette}
            title="No More Artworks"
            description="This is the only artwork available from this artist."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <SectionTitle title="More Artworks from This Artist" />
      {totalArtworks > limit && (
        <div className="flex justify-center mt-4 mb-12">
          <Link to={`/artist/${userId}?tab=artworks`}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      )}

      {/* Grid Layout - 4 columns responsive */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork) => (
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
    </section>
  );
}

