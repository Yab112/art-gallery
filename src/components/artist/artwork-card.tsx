import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface Artwork {
  id: number;
  title: string;
  year: number;
  artist: string;
  gallery: string;
  price: string;
  image: string;
  height: number;
  sold: boolean;
  medium: string;
  rarity: string;
}

interface ArtworkCardProps {
  artwork: Artwork;
  onImageClick?: (src: string) => void;
}

export function ArtworkCard({ artwork, onImageClick }: ArtworkCardProps) {
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setImagePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setImagePosition({ x: 50, y: 50 });
    setIsHovered(false);
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(artwork.image);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/20 transition-all duration-300">
      {/* Image Container with Zoom Effect */}
      <div
        className="zoom-container relative bg-gallery-neutral cursor-pointer"
        style={{ height: `${artwork.height * 0.6}px` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleImageClick}
      >
        {imageError || !artwork.image ? (
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
            src={artwork.image}
            alt={artwork.title}
            className="zoom-image w-full h-full object-cover transition-transform duration-300"
            style={{
              transformOrigin: `${imagePosition.x}% ${imagePosition.y}%`,
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
            onError={() => setImageError(true)}
          />
        )}

        {artwork.sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              SOLD
            </span>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                // Handle purchase logic
              }}
            >
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-foreground text-pretty">
            {artwork.artist}
          </h3>
          <p className="text-sm text-muted-foreground italic text-pretty">
            {artwork.title}, {artwork.year}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{artwork.medium}</span>
          <span>{artwork.rarity}</span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{artwork.gallery}</p>
          <p
            className={`text-sm font-medium ${
              artwork.sold ? "text-red-600" : "text-foreground"
            }`}
          >
            {artwork.sold ? "SOLD" : artwork.price}
          </p>
        </div>
      </div>
    </div>
  );
}
