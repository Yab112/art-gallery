import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddFavorite } from "@/services/favorites/useAddFavorite";
import { useRemoveFavorite } from "@/services/favorites/useRemoveFavorite";
import { useCheckFavorite } from "@/queries/favoriteQueries";

interface ArtworkCardProps {
  id: string;
  image: string;
  title: string;
  artist: string;
  price: string;
  year?: string;
  medium: string;
  dimensions: string;
  seller: string;
  onFavorite?: (id: string) => void;
  onSearch?: (id: string) => void;
  isMasonry?: boolean;
  onImageClick?: (src: string) => void;
  artworks?: any[];
}

export function ArtworkCard({
  id,
  image,
  title,
  artist,
  price,
  year,
  medium,
  dimensions,
  seller,
  onFavorite,
  onSearch,
  isMasonry = false,
}: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Check if artwork is favorited
  const { data: favoriteCheck } = useCheckFavorite(id);
  const isFavorited = favoriteCheck?.isFavorite || false;

  // Mutations
  const { addFavorite } = useAddFavorite();
  const { removeFavorite } = useRemoveFavorite();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorited) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
      onFavorite?.(id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };
  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => navigate(`/artwork/${id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") navigate(`/artwork/${id}`);
      }}
    >
      {/* Artwork Image Container */}
      <div
        className={cn(
          "relative mb-4 overflow-hidden bg-gray-100",
          !isMasonry && "aspect-[4/5]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imageError || !image ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-xs text-gray-500">No Image</p>
            </div>
          </div>
        ) : (
          <img
            src={image}
            alt={`${title} by ${artist}`}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {/* Overlay background on hover */}
        <div
          className={`pointer-events-none absolute inset-0 cursor-pointer transition-all duration-500 ease-in-out ${
            isHovered ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
          }`}
        />
        {/* Hover Buttons - slide down from top */}
        <div
          className={`absolute top-24 right-0 left-0 z-10 flex cursor-pointer justify-center gap-2 p-4 transition-all duration-500 ease-in-out ${
            isHovered
              ? "pointer-events-auto translate-y-10 opacity-100"
              : "-translate-y-full pointer-events-none opacity-0"
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 shadow-md hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/artwork/${id}`);
            }}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={`bg-white/90 shadow-md hover:bg-white ${isFavorited ? "text-red-500" : ""}`}
            onClick={handleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Artwork Details */}
      <div className="space-y-1">
        <h3 className="font-semibold text-black text-sm uppercase tracking-wide">
          {artist}
        </h3>
        <p className="text-gray-600 text-sm">
          <span className="text-orange-500">🏆</span> {title}{" "}
          {year && `(${year})`}
        </p>
        <p className="font-bold text-lg">{price}</p>
        <p className="text-gray-600 text-sm">
          {medium} ({dimensions})
        </p>
        <p className="text-gray-500 text-sm">Seller: {seller}</p>
      </div>
    </div>
  );
}
