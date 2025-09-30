import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";

interface Artwork {
  id: string;
  image: string;
  title: string;
  artist: string;
  price: string;
  year: string;
  medium: string;
  dimensions: string;
  seller: string;
}

interface ArtworkGridProps {
  artworks: Artwork[];
  viewMode: "grid" | "list";
  onFavorite: (id: string) => void;
  onLoadMore?: () => void;
}

export function ArtworkGrid({
  artworks,
  viewMode,
  onFavorite,
  onLoadMore,
}: ArtworkGridProps) {
  return (
    <section className="px-4 ">
      <div className="mx-auto max-w-7xl">
        <div
          className={`grid gap-8 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {artworks.map((artwork) => (
            <div key={artwork.id} className="group">
              <ArtworkCard
                {...artwork}
                onFavorite={onFavorite}
                isMasonry={false}
              />
            </div>
          ))}
        </div>

        {onLoadMore && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-black bg-white px-8 py-3 text-black hover:bg-gray-100"
              onClick={onLoadMore}
            >
              Load More Artworks
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
