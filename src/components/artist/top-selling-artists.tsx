import { useRef } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtistCard } from "./artist-circle-card";

interface Artist {
  id: string;
  name: string;
  country: string;
  followers: number;
  artworks: number;
  avatar: string;
  tags?: string[];
  sales?: number;
  views?: number;
  rating?: number;
  isTopSelling?: boolean;
  isMostViewed?: boolean;
}

interface TopSellingArtistsProps {
  artists: Artist[];
}

export function TopSellingArtists({ artists }: TopSellingArtistsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const topSellingArtists = artists
    .filter((artist) => artist.isTopSelling)
    .sort((a, b) => (b.sales || 0) - (a.sales || 0));

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 300; // Adjust scroll amount as needed
      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 300; // Adjust scroll amount as needed
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8 lg:mb-12 overflow-x-hidden">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-700" />
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
            Top Selling Artists
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={scrollLeft}
            className="h-8 w-8 p-0 bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={scrollRight}
            className="h-8 w-8 p-0 bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-3 md:gap-4 lg:gap-4 pb-4 px-2">
          {topSellingArtists.map((artist) => (
            <div
              key={`top-${artist.id}`}
              className="flex-shrink-0 w-48 sm:w-52 md:w-56 lg:w-64"
            >
              <ArtistCard artist={artist} showSales={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
