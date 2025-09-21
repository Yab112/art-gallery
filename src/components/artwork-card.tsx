import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleFavorite = () => {
    console.log("[v0] Favorite clicked for artwork:", id);
    onFavorite?.(id);
  };

  const navigate = useNavigate();
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
          "relative mb-4 overflow-hidden ",
          !isMasonry && "aspect-[4/5]"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={image || "/placeholder.svg"}
          alt={`${title} by ${artist}`}
          className="h-full w-full object-cover"
        />
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
            className="bg-white/90 shadow-md hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
          >
            <Heart className="h-4 w-4" />
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
